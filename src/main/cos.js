/**
 * Created by michael on 2017/6/29.
 */
'use strict'
import { ipcMain } from 'electron'
import Cos from 'cos-nodejs-sdk-v5'
import { MockDownloadTask, MockUploadTask, Tasks, TaskStatus } from './task'
import fs from 'fs'
import path from 'path'

export default function () {
  let cos = new Cos({
    AppId: '1253834952',
    SecretId: 'AKIDa4NkxzaV0Ut7Yr4sa6ScbNwMdibHb4A4',
    SecretKey: 'qUwCGAsRq46wZ1HLCrKbhfS8e0A8tUu8'
  })

  ipcMain.on('ListBucket', (event) => {
    cos.getService((err, data) => {
      if (err) {
        event.sender.send('ListBucket-error', err)
      }
      let returnValue = []
      data.Buckets.forEach((v) => {
        v.Name = v.Name.split('-')[0]
        returnValue.push(v)
      })
      event.sender.send('ListBucket-data', returnValue)
    })
  })

  ipcMain.on('ListObject', (event, arg) => {
    /**
     * @param  {object}   arg
     * @param  {string}   arg.Bucket
     * @param  {string}   arg.Region
     * @param  {string}   [arg.Prefix]
     */
    listDir(cos, arg).then(data => {
      event.sender.send('ListObject-data', data)
    })
  })

  /**
   * 创建 Bucket，并初始化访问权限
   * @param  {object}   arg     参数对象，必须
   *     @param  {string}   arg.Bucket     Bucket名称，必须
   *     @param  {string}   arg.Region     地域名称，必须
   *     @param  {string}   arg.ACL        用户自定义文件权限，可以设置：private，public-read；默认值：private，非必须
   *     @param  {string}   arg.GrantRead     赋予被授权者读的权限，格式x-cos-grant-read: uin=" ",uin=" "，非必须
   *     @param  {string}   arg.GrantWrite     赋予被授权者写的权限，格式x-cos-grant-write: uin=" ",uin=" "，非必须
   *     @param  {string}   arg.GrantFullControl     赋予被授权者读写权限，格式x-cos-grant-full-control: uin=" ",uin=" "，非必须
   * @param  {function}   callback      回调函数，必须
   * @return  {object}    err     请求失败的错误，如果请求成功，则为空。
   * @return  {object}    data  返回的数据
   *     @return  {string}    data.Location  操作地址
   */
  // ipcMain.on('PutBucket', (event, arg) => {
  //   cos.putBucket(arg, (err, data) => {
  //     if (err) {
  //       event.sender.send('PutBucket-error', err)
  //     }
  //     event.sender.send('PutBucket-data', data.Location)
  //   })
  // })

  /**
   * 删除 Bucket
   * @param  {object}   arg     参数对象，必须
   *     @param  {string}   arg.Bucket     Bucket名称，必须
   *     @param  {string}   arg.Region     地域名称，必须
   * @param  {function}   callback      回调函数，必须
   * @return  {object}    err     请求失败的错误，如果请求成功，则为空。
   * @return  {object}    data  返回的数据
   *     @return  {string}    data.Location  操作地址
   */
  // ipcMain.on('DeleteBucket', (event, arg) => {
  //   cos.putBucket(arg, (err, data) => {
  //     if (err) {
  //       event.sender.send('DeleteBucket-error', err)
  //     }
  //     event.sender.send('DeleteBucket-data', data.Location)
  //   })
  // })

  // ipcMain.on('DeleteObject', (event, arg) => {
  //   cos.putBucket(arg, (err, data) => {
  //     if (err) {
  //       event.sender.send('DeleteBucket-error', err)
  //     }
  //     event.sender.send('DeleteBucket-data', data.Location)
  //   })
  // })

  let uploadsRefresh

  let uploads = new Tasks(3)

  ipcMain.on('GetUploadTasks', (event) => {
    let send = () => {
      event.sender.send('GetUploadTasks-data', uploads.tasks.map(t => {
        return {
          id: t.id,
          Key: t.params.Key,
          FileName: t.file.fileName,
          status: t.status,
          size: t.progress.total,
          loaded: t.progress.loaded,
          speed: t.progress.speed
        }
      }))
    }
    let obj
    uploadsRefresh = () => {
      send()
      clearInterval(obj)
      if (!uploads.empty()) {
        obj = setInterval(send, 200)
      }
    }
  })

  ipcMain.on('NewUploadTask', (event, arg) => {
    /**
     * @param  {object}   arg
     * @param  {string}   arg.Bucket
     * @param  {string}   arg.Region
     * @param  {string}   arg.Prefix
     * @param  {string}   arg.FileName
     */
    // todo 同源不同目标
    if (uploads.tasks.find(t => t && t.file.fileName === arg.FileName)) return

    let iterator = traverseDir(arg.FileName, arg.Prefix)

    let c = 10
    let fn = () => {
      let item = iterator.next()
      if (item.done) {
        uploadsRefresh()
        return
      }
      new MockUploadTask(cos, item.value.name, {
        Bucket: arg.Bucket,
        Region: arg.Region,
        Key: item.value.key
      }).then(task => {
        uploads.newTask(task)
          .then(
            result => (console.log(result)),
            err => {
              if (err.message !== 'cancel') {
                console.log(err)
              }
            }
          )
        uploads.next()
        c--
        if (c <= 0) {
          c = 10
          uploadsRefresh()
        }
        fn()
      })
    }
    fn()
  })

  ipcMain.on('PauseUploadTasks', (event, arg) => {
    /**
     * @param {object}  arg
     * @param {int[]}   arg.tasks
     * @param {boolean} arg.wait
     */
    arg.tasks.forEach(id => {
      let task = uploads.findTask(id)
      if (!task) return
      if (task.status === TaskStatus.RUN) {
        task.stop()
      }
      task.status = arg.wait ? TaskStatus.WAIT : TaskStatus.PAUSE
    })
    uploadsRefresh()
  })

  ipcMain.on('ResumeUploadTask', (event, arg) => {
    /**
     * @param {object}  arg
     * @param {int[]}   arg.tasks
     * @param {boolean} arg.wait
     */
    arg.tasks.forEach(id => {
      let task = uploads.findTask(id)
      if (!task) return
      if (task.status === TaskStatus.PAUSE) {
        task.status = TaskStatus.WAIT
      }
      uploads.next()
    })
    uploadsRefresh()
  })

  ipcMain.on('DeleteUploadTasks', (event, arg) => {
    /**
     * @param {object} arg
     * @param {int[]}  arg.tasks
     */
    arg.tasks.forEach(id => {
      let task = uploads.findTask(id)
      if (!task) return
      if (task.status === TaskStatus.RUN) {
        task.stop()
      }
      uploads.deleteTask(id)
    })
    uploadsRefresh()
  })

  let downloadsRefresh

  let downloads = new Tasks(3)

  ipcMain.on('GetDownloadTasks', (event) => {
    let send = () => {
      event.sender.send('GetDownloadTasks-data', downloads.tasks.map(t => {
        return {
          id: t.id,
          Key: t.params.Key,
          FileName: t.file.fileName,
          status: t.status,
          size: t.progress.total,
          loaded: t.progress.loaded,
          speed: t.progress.speed
        }
      }))
    }
    let obj
    downloadsRefresh = () => {
      send()
      clearInterval(obj)
      if (!downloads.empty()) {
        obj = setInterval(send, 200)
      }
    }
  })

  ipcMain.on('NewDownloadTask', (event, arg) => {
    /**
     * @param  {object}   arg
     * @param  {string}   arg.Bucket
     * @param  {string}   arg.Region
     * @param  {string}   arg.Path     下载路径
     * @param  {string}   [arg.Key]    单文件下载
     * @param  {string}   [arg.Prefix] 文件夹下载
     */
    // todo 同源不同目标
    if (uploads.tasks.find(t => t && t.file.fileName === arg.FileName)) return

    new MockDownloadTask(cos, arg.FileName, {
      Bucket: arg.Bucket,
      Region: arg.Region,
      Key: arg.Key
    }).then(task => {
      downloads.newTask(task)
        .then(
          result => (console.log(result)),
          err => {
            if (err.message !== 'cancel') {
              console.log(err)
            }
          }
        )
      downloads.next()
      downloadsRefresh()
    })
  })

  ipcMain.on('PauseDownloadTasks', (event, arg) => {
    /**
     * @param {object}  arg
     * @param {int[]}   arg.tasks
     * @param {boolean} arg.wait
     */
    arg.tasks.forEach(id => {
      let task = downloads.findTask(id)
      if (!task) return
      if (task.status === TaskStatus.RUN) {
        task.stop()
      }
      task.status = arg.wait ? TaskStatus.WAIT : TaskStatus.PAUSE
    })
    downloadsRefresh()
  })

  ipcMain.on('ResumeDownloadTask', (event, arg) => {
    /**
     * @param {object}  arg
     * @param {int[]}   arg.tasks
     * @param {boolean} arg.wait
     */
    arg.tasks.forEach(id => {
      let task = uploads.findTask(id)
      if (!task) return
      if (task.status === TaskStatus.PAUSE) {
        task.status = TaskStatus.WAIT
      }
      uploads.next()
    })
    downloadsRefresh()
  })

  ipcMain.on('DeleteDownloadTasks', (event, arg) => {
    /**
     * @param {object} arg
     * @param {int[]} arg.tasks
     */
    arg.tasks.forEach(id => {
      let task = downloads.findTask(id)
      if (!task) return
      if (task.status === TaskStatus.RUN) {
        task.stop()
      }
      downloads.deleteTask(id)
    })
    downloadsRefresh()
  })
}

function listDir (cos, params) {
  let dirs = []
  let objects = []
  params.Delimiter = '/'
  let p = () => new Promise((resolve, reject) => {
    cos.getBucket(params, (err, result) => {
      if (err) {
        reject(err)
        return
      }
      let pflen = params.Prefix ? params.Prefix.length : 0
      result.CommonPrefixes.forEach(v => {
        if (v.Prefix !== params.Prefix) {
          dirs.push({
            Name: v.Prefix.slice(pflen, -1),
            Prefix: v.Prefix
          })
        }
      })
      result.Contents.forEach(v => objects.push(Object.assign({Name: v.Key.slice(pflen)}, v)))
      if (result.IsTruncated === 'true') {
        params.Marker = result.NextMarker
        return p().then(resolve, reject)
      } else {
        // console.log(dirs, objects);
        resolve({dirs, objects})
      }
    })
  })
  return p()
}

function* traverseDir (name, prefix) {
  let src = []
  name = path.normalize(name)
  prefix = prefix.substr(-1) === '/' ? prefix.substr(0, prefix.length - 1) : prefix

  if (!fs.statSync(name).isDirectory()) {
    yield {
      name,
      key: prefix + '/' + path.basename(name)
    }
    return
  }

  let dirLen = path.dirname(name).length + 1
  src.push(name)

  while (src.length) {
    let dir = src.shift()
    for (let name of fs.readdirSync(dir)) {
      name = path.join(dir, name)
      if (fs.statSync(name).isDirectory()) {
        src.push(name)
        continue
      }
      yield {
        name,
        key: prefix + '/' + name.substr(dirLen).replace('\\', '/')
      }
    }
  }
}
