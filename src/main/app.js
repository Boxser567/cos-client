/**
 * Created by michael on 2017/6/29.
 */
'use strict'
import fs from 'fs'
import path from 'path'
import { ipcMain } from 'electron'
import Cos from 'cos-nodejs-sdk-v5'
import { MockDownloadTask as DownloadTask, MockUploadTask as UploadTask, Tasks, TaskStatus } from './task'
import { init, save } from './db'

let app

function App () {
  if (app) return app
  app = this
  app.init()
}

App.prototype.init = async function () {
  let uploads
  let downloads

  let config = await init.config()

  let cos

  ipcMain.on('LoginCheck', (event) => {
    event.returnValue = !!config.cos
  })

  ipcMain.on('Login', (event, arg) => {
    switch (arg.action) {
      case 'check':
        if (arg.form.password !== config.password) {
          event.returnValue = {message: 'password mismatch'}
          return
        }
        cos = new Cos(config.cos)
        break
      case 'new':
        config.cos = {
          // todo only for debug
          AppId: '1253834952',
          SecretId: arg.form.SecretId,
          SecretKey: arg.form.SecretKey
        }
        config.password = arg.form.password
        cos = new Cos(config.cos)
        break
      case 'clean':
        // todo
        break
    }
    event.returnValue = null
  })

  ipcMain.on('ListBucket', (event) => {
    cos.getService((err, data) => {
      if (err) {
        event.sender.send('ListBucket-error', err)
      }
      let result = {}
      data.Buckets.forEach(v => {
        let ss = v.Name.split('-')
        v.Name = ss[0]
        v.AppId = ss[1]
        if (Array.isArray(result[v.AppId])) {
          result[v.AppId].push(v)
        } else {
          result[v.AppId] = [v]
        }
      })
      event.sender.send('ListBucket-data', result)
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
  ipcMain.on('HeadBucket', (event, arg) => {
    cos.headBucket(arg, (err, data) => {
      if (err) {
        event.sender.send('HeadBucket-error', err)
      }
      event.sender.send('HeadBucket-data', data)
    })
  })

  ipcMain.on('PutBucket', (event, arg) => {
    cos.putBucket(arg, (err, data) => {
      if (err) {
        event.sender.send('PutBucket-error', err)
      }
      event.sender.send('PutBucket-data', data)
    })
  })

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
  ipcMain.on('DeleteBucket', (event, arg) => {
    cos.deleteBucket(arg, (err, data) => {
      if (err) {
        event.sender.send('DeleteBucket-error', err)
      }
      event.sender.send('DeleteBucket-data', data)
    })
  })

  ipcMain.on('ListObject', (event, arg) => {
    /**
     * @param  {object}   arg
     * @param  {string}   arg.Bucket
     * @param  {string}   arg.Region
     * @param  {string}   [arg.Prefix]
     */
    listDir(cos, arg).then(
      data => (event.sender.send('ListObject-data', data)),
      err => (event.sender.send('ListObject-error', err))
    )
  })

  ipcMain.on('HeadObject', (event, arg) => {
    cos.headObject(arg, (err, data) => {
      if (err) {
        event.sender.send('HeadObject-error', err)
      }
      event.sender.send('HeadObject-data', data)
    })
  })

  ipcMain.on('DeleteObject', (event, arg) => {
    cos.deleteObject(arg, (err, data) => {
      if (err) {
        event.sender.send('DeleteObject-error', err)
      }
      event.sender.send('DeleteObject-data', data)
    })
  })

  ipcMain.on('GetUploadTasks', async (event) => {
    if (uploads) {
      uploads.refresher.event = event
      uploads.refresh(true)
      return
    }
    uploads = new Tasks(3)
    uploads.setRefresher(event, 'GetUploadTasks-data')
    let tasks = await init.upload()
    for (let t of tasks) {
      try {
        let task = await new UploadTask(cos, t.name, t.params, t.option)
        task.modify = '+'
        uploads.newTask(task).then(
          () => {
            task.modify = '*'
            task.progress.loaded = task.progress.total
            uploads.refresh()
          },
          err => {
            task.modify = '*'
            if (err.message !== 'cancel') {
              console.log('task error', err)
            }
            uploads.refresh()
          })
        task.progress.loaded = t.loaded
        task.progress.total = t.total
        task.status = t.status
        uploads.refresh()
      } catch (e) {
        console.log(e)
      }
    }
    uploads.refresh(true)
  })

  ipcMain.on('NewUploadTasks', async (event, arg) => {
    /**
     * @param  {object}   arg
     * @param  {string}   arg.Bucket
     * @param  {string}   arg.Region
     * @param  {string}   arg.Prefix
     * @param  {string[]} arg.FileNames
     */
    // todo 同源不同目标
    // if (uploads.tasks.find(t => t && t.file.fileName === arg.FileName)) return

    for (let name of arg.FileNames) {
      for (let item of uploadGenerator(name, arg.Prefix)) {
        try {
          let task = await new UploadTask(cos, item.name, {
            Bucket: arg.Bucket,
            Region: arg.Region,
            Key: item.key
          })
          task.modify = '+'
          // newTask.then 在整个上传完成后调用
          uploads.newTask(task).then(
            () => {
              task.modify = '*'
              task.progress.loaded = task.progress.total
              uploads.refresh()
              console.log('task done', task.id)
            },
            err => {
              task.modify = '*'
              if (err.message !== 'cancel') {
                console.log('task error', err)
              }
              uploads.refresh()
            })
        } catch (e) {
          console.log(e)
        }
        uploads.next()
        uploads.refresh() // newTask, next 都有更新逻辑
      }
    }
    uploads.refresh(true)
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
      task.modify = '*'
      if (task.status === TaskStatus.RUN) {
        task.stop()
      }
      task.status = arg.wait ? TaskStatus.WAIT : TaskStatus.PAUSE
    })
    uploads.refresh(true)
  })

  ipcMain.on('ResumeUploadTask', (event, arg) => {
    /**
     * @param {object}  arg
     * @param {int[]}   arg.tasks
     */
    arg.tasks.forEach(id => {
      let task = uploads.findTask(id)
      if (!task) return
      task.modify = '*'
      if (task.status === TaskStatus.PAUSE) {
        task.status = TaskStatus.WAIT
      }
      uploads.next()
    })
    uploads.refresh(true)
  })

  ipcMain.on('DeleteUploadTasks', (event, arg) => {
    /**
     * @param {object} arg
     * @param {int[]}  arg.tasks
     */
    arg.tasks.forEach(id => {
      let task = uploads.findTask(id)
      if (!task) return
      task.modify = '-'
      if (task.status === TaskStatus.RUN) {
        task.stop()
      }
      uploads.deleteTask(id)
    })
    uploads.refresh(true)
  })

  ipcMain.on('GetDownloadTasks', async (event) => {
    if (downloads) {
      downloads.refresher.event = event
      downloads.refresh(true)
      return
    }
    downloads = new Tasks(3)
    downloads.setRefresher(event, 'GetDownloadTasks-data')
    let tasks = await init.download()
    for (let t of tasks) {
      try {
        let task = await new DownloadTask(cos, t.name, t.params, t.option)
        task.modify = '+'
        downloads.newTask(task).then(
          () => {
            task.modify = '*'
            task.progress.loaded = task.progress.total
            downloads.refresh()
          },
          err => {
            task.modify = '*'
            if (err.message !== 'cancel') {
              console.log('task error', err)
            }
            downloads.refresh()
          })
        task.progress.loaded = t.loaded
        task.progress.total = t.total
        task.status = t.status
        downloads.refresh()
      } catch (e) {
        console.log(e)
      }
    }
    downloads.refresh(true)
  })

  ipcMain.on('NewDownloadTasks', async (event, arg) => {
    /**
     * @param  {object}    arg
     * @param  {string}    arg.Bucket
     * @param  {string}    arg.Region
     * @param  {string}    arg.Path       本地路径
     * @param  {string}    arg.Prefix     远程路径
     * @param  {string[]}  [arg.Keys]     文件下载
     * @param  {string[]}  [arg.Dirs] 文件夹下载
     */
      // todo 同源不同目标
      // if (uploads.tasks.find(t => t && t.file.fileName === arg.FileName)) return
    let params = {
        Bucket: arg.Bucket,
        Region: arg.Region
      }

    async function fn (contents) {
      for (let item of downloadGenerator(arg.Path, arg.Prefix, contents)) {
        try {
          let task = await new DownloadTask(cos, item.name, {
            Bucket: arg.Bucket,
            Region: arg.Region,
            Key: item.key
          })
          task.modify = '+'
          downloads.newTask(task).then(
            result => {
              task.modify = '*'
              console.log('task done')
              downloads.refresh()
            },
            err => {
              task.modify = '*'
              if (err.message !== 'cancel') console.log(err)
              downloads.refresh()
            }
          )
          downloads.next()
          downloads.refresh()
        } catch (err) {
          console.log(err)
        }
      }
    }

    if (arg.Keys) {
      await fn(arg.Keys.map(k => ({Key: k, Size: '1'})))
    }

    for (let dir of arg.Dirs) {
      params.Prefix = dir
      let result
      do {
        result = await getBucket(cos, params)
        await fn(result.Contents)
        params.Marker = result.NextMarker
      } while (result.IsTruncated)
    }
    downloads.refresh(true)
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
      task.modify = '*'
      if (task.status === TaskStatus.RUN) {
        task.stop()
      }
      task.status = arg.wait ? TaskStatus.WAIT : TaskStatus.PAUSE
    })
    downloads.refresh(true)
  })

  ipcMain.on('ResumeDownloadTask', (event, arg) => {
    /**
     * @param {object}  arg
     * @param {int[]}   arg.tasks
     */
    arg.tasks.forEach(id => {
      let task = downloads.findTask(id)
      console.log('task', task)
      if (!task) return
      task.modify = '*'
      if (task.status === TaskStatus.PAUSE) {
        task.status = TaskStatus.WAIT
      }
      downloads.next()
    })
    downloads.refresh(true)
  })

  ipcMain.on('DeleteDownloadTasks', (event, arg) => {
    /**
     * @param {object} arg
     * @param {int[]} arg.tasks
     */
    arg.tasks.forEach(id => {
      let task = downloads.findTask(id)
      if (!task) return
      task.modify = '-'
      if (task.status === TaskStatus.RUN) {
        task.stop()
      }
      downloads.deleteTask(id)
    })
    downloads.refresh(true)
  })

  this.save = function () {
    if (!uploads || !downloads) return Promise.resolve()
    return Promise.all([
      save.config(config),
      save.upload(uploads.tasks),
      save.download(downloads.tasks)
    ])
  }
}

async function listDir (cos, params) {
  let dirs = []
  let objects = []
  params.Delimiter = '/'
  let result
  let pflen = params.Prefix ? params.Prefix.length : 0

  do {
    result = await new Promise((resolve, reject) => {
      cos.getBucket(params, (err, result) => { err ? reject(err) : resolve(result) })
    })

    result.CommonPrefixes.forEach(v => {
      if (v.Prefix !== params.Prefix) {
        dirs.push({
          Name: v.Prefix.slice(pflen, -1),
          Prefix: v.Prefix
        })
      }
    })
    result.Contents.forEach(v => objects.push(Object.assign({Name: v.Key.slice(pflen)}, v)))

    params.Marker = result.NextMarker
  } while (result.IsTruncated === 'true')
  return {dirs, objects}
}

function* uploadGenerator (name, prefix) {
  let src = []
  name = path.normalize(name)
  if (prefix !== '') {
    prefix = prefix.substr(-1) === '/' ? prefix : prefix + '/'
  }

  if (!fs.statSync(name).isDirectory()) {
    yield {name, key: prefix + path.basename(name)}
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
      yield {name, key: prefix + name.substr(dirLen).replace('\\', '/')}
    }
  }
}

function* downloadGenerator (downloadPath, prefix, contents) {
  if (prefix !== '') {
    prefix = prefix.substr(-1) === '/' ? prefix : prefix + '/'
  }
  let pflen = prefix.length
  for (let content of contents) {
    if (content.Size === '0') continue
    yield {
      name: path.join(downloadPath, content.Key.substr(pflen)),
      key: content.Key
    }
  }
}

function getBucket (cos, params) {
  return new Promise((resolve, reject) => {
    cos.getBucket(params, (err, data) => {
      err ? reject(err) : resolve(data)
    })
  })
}

export { App }
