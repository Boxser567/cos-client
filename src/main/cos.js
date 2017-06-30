/**
 * Created by michael on 2017/6/29.
 */
'use strict'
import { ipcMain } from 'electron'
import Cos from 'cos-nodejs-sdk-v5'
import fs from 'fs'

export default function () {
  let cos = new Cos({
    AppId: '1253834952',
    SecretId: 'AKIDa4NkxzaV0Ut7Yr4sa6ScbNwMdibHb4A4',
    SecretKey: 'qUwCGAsRq46wZ1HLCrKbhfS8e0A8tUu8'
  })
  let uploads = new Tasks(5)

  ipcMain.on('GetBucket', (event, arg) => {
    cos.getService((err, data) => {
      if (err) {
        event.sender.send('GetBucket-error', err)
      }
      let returnValue = []
      data.Buckets.forEach((v) => {
        v.Name = v.Name.split('-')[0]
        returnValue.push(v)
      })
      event.sender.send('GetBucket-data', returnValue)
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
  ipcMain.on('PutBucket', (event, arg) => {
    cos.putBucket(arg, (err, data) => {
      if (err) {
        event.sender.send('PutBucket-error', err)
      }
      event.sender.send('PutBucket-data', data.Location)
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
    cos.putBucket(arg, (err, data) => {
      if (err) {
        event.sender.send('DeleteBucket-error', err)
      }
      event.sender.send('DeleteBucket-data', data.Location)
    })
  })

  ipcMain.on('GetObject', (event, arg) => {
    cos.putBucket(arg, (err, data) => {
      if (err) {
        event.sender.send('GetObject-error', err)
      }
      event.sender.send('GetObject-data', data.Location)
    })
  })

  ipcMain.on('PutObject', (event, arg) => {
    arg.forEach((item) => {

    })
    // todo
    cos.sliceUploadFile(arg)
    cos.putBucket(arg, (err, data) => {
      if (err) {
        event.sender.send('PutObject-error', err)
      }
      event.sender.send('PutObject-data', data.Location)
    })
  })

  ipcMain.on('DeleteObject', (event, arg) => {
    cos.putBucket(arg, (err, data) => {
      if (err) {
        event.sender.send('DeleteBucket-error', err)
      }
      event.sender.send('DeleteBucket-data', data.Location)
    })
  })

  ipcMain.on('NewUploadTask', (event, arg) => {
    // let task = uploads.findTaskByFileName(arg.FileName)
    // if (task) {
    //   return
    // }
    // todo
    new MockTask(arg).then(task => {
      uploads.newTask(task)
      uploads.next()
    })
  })

  ipcMain.on('GetUploadTasks', (event, arg) => {
    setInterval(() => {
      event.sender.send('GetUploadTasks-data', uploads.tasks)
    }, 500)
  })
}

const TaskWait = 'wait'
const TaskRun = 'run'
const TaskComplete = 'complete'
const TaskError = 'error'

function Tasks (max) {
  let nextId = 0
  let maxActivity = max
  let activity = 0
  this.tasks = []
  this.needSend = false
  this.getId = () => nextId++
  this.add = () => {
    if (activity <= maxActivity) {
      activity++
      return true
    }
    return false
  }
  this.done = () => {
    if (activity > 0) {
      activity--
      return
    }
    throw new Error('broken task status')
  }
  this.getActivity = () => activity
}

Tasks.prototype.newTask = function (task) {
  let id = this.getId()
  task.id = id
  task.status = TaskWait
  this.tasks[id] = task
  this.needSend = true
  return task
}

Tasks.prototype.findTask = function (id) {
  return this.tasks[id]
}

Tasks.prototype.findTaskByFileName = function (name) {
  // todo
  return this.tasks.find(t => t.file.name === name)
}

Tasks.prototype.deleteTask = function (id) {
  let t = this.tasks[id]
  delete this.tasks[id]
  this.needSend = true
  return t
}

Tasks.prototype.next = function () {
  let task = this.tasks.find(t => t.status === TaskWait)
  if (!task) {
    return Promise.resolve()
  }
  task.status = TaskRun
  this.add()
  return task.start().then(result => {
    task.status = TaskComplete
    this.done()
    // todo
    return this.next()
  }, err => {
    task.status = TaskError
    this.done()
    // todo
    console.log(err)
    return this.next()
  })
}

/**
 *
 * @param  {object}   cos
 * @param  {string}   name
 *
 * @param  {object}   params
 * @param  {string}   params.Bucket
 * @param  {string}   params.Region
 * @param  {string}   params.Key
 * @param  {string}   params.UploadId 仅续传任务需要
 *
 * @param  {object}   option
 * @param  {function} option.onProgress
 * @param  {int}      option.sliceSize
 * @param  {int}      option.asyncLim
 */
function UploadTask (cos, name, params, option = {}) {
  this.cos = cos
  this.params = params
  this.file = {}
  this.onProgress = option.onProgress
  this.asyncLim = option.asyncLim || 2
  this.cancel = false

  return new Promise((resolve, reject) => {
    fs.stat(name, (err, stats) => {
      if (err) {
        reject(err)
        return
      }

      this.file = {
        fileName: name,
        fileSize: stats.size,
        sliceSize: option.sliceSize || 1 << 20
      }

      let n = this.file.fileSize
      this.progress = {list: [], total: this.file.fileSize}
      while (n > this.file.sliceSize) {
        this.progress.list.push({total: this.file.sliceSize})
        n -= this.file.sliceSize
      }
      this.progress.list.push({total: n})

      this.file.iterator = getSliceIterator(this.file)

      if (typeof this.onProgress !== 'function') {
        this.progress.On = () => null
      } else {
        this.progress.On = () => {
          let loaded = 0
          let total = this.progress.total
          this.progress.list.forEach(piece => (loaded += piece.loaded || 0))
          this.onProgress({
            loaded,
            total,
            percent: loaded / total
          })
        }
      }
      resolve(this)
    })
  })
}

UploadTask.prototype.start = function () {
  return (this.params.UploadId ? this.getMultipartListPart() : this.multipartInit())
    .then(this.uploadSlice.bind(this))
    .then(this.multipartComplete.bind(this), err => {
      err.params = this.params
      throw err
    })
}

UploadTask.prototype.multipartInit = function () {
  return new Promise((resolve, reject) => {
    this.cos.multipartInit(this.params, (err, result) => {
      if (err) { return reject(err) }
      if (!result.UploadId) { return reject(new Error('null UploadId')) }
      console.info('sliceUploadFile: 创建新上传任务成功，UploadId: ', result.UploadId)
      this.params.UploadId = result.UploadId
      resolve()
    })
  })
}

UploadTask.prototype.getMultipartListPart = function () {
  let list = []
  let params = this.params
  let p = () => new Promise((resolve, reject) => {
    this.cos.multipartListPart(params, (err, result) => {
      if (err) {
        reject(err)
        return
      }

      result.Part.forEach(part => {
        list[part.PartNumber - 1] = {
          PartNumber: part.PartNumber,
          ETag: part.ETag
        }
      })

      if (result.IsTruncated === 'true') {
        params.PartNumberMarker = result.NextPartNumberMarker
        p().then(resolve, reject)
        return
      }
      this.params.Parts = list
      resolve()
    })
  })
  return p()
}

/**
 * @private
 */
UploadTask.prototype.uploadSlice = function () {
  return Promise.all(new Array(this.asyncLim).fill(0).map(() => this.upload()))
}

UploadTask.prototype.upload = function () {
  let item = this.file.iterator.next()
  this.params.Parts = this.params.Parts || []
  if (item.done) {
    return Promise.resolve()
  }

  return item.value.then(result => {
    let pg = this.progress.list[result.index - 1]

    if (this.params.Parts[result.index - 1] &&
      this.params.Parts[result.index - 1].ETag === `"${result.hash}"`) {
      console.info('upload: 秒传', result.index, result.hash)
      pg.loaded = pg.total
      this.progress.On()
      return this.upload()
    }

    return new Promise((resolve, reject) => {
      this.cos.multipartUpload(Object.assign({
        PartNumber: result.index,
        ContentLength: result.length,
        Body: result.body,
        onProgress: (data) => {
          pg.loaded = data.loaded
          this.progress.On()
        }
        // todo 在sdk更新后换成 ContentMD5
        // ContentSha1: '"' + result.hash + '"'
      }, this.params), (err, data) => {
        if (err) {
          reject(err)
          return
        }
        // todo do data need be check?
        if (data.ETag === `"${result.hash}"`) {
          console.info('upload: 分片完成', result.index, result.hash, data)
        } else {
          console.warn('upload: 分片ETag不一致', result.index, result.hash, data)
        }
        if (this.cancel) {
          reject(new Error('upload cancel'))
          return
        }
        this.params.Parts[result.index - 1] = {
          PartNumber: result.index,
          ETag: data.ETag
        }
        this.upload().then(resolve, reject)
      })
    })
  })
}

UploadTask.prototype.multipartComplete = function () {
  return new Promise((resolve, reject) => {
    // todo
    console.log(this.params)
    this.cos.multipartComplete(this.params, (err, result) => {
      err ? reject(err) : resolve(result)
    })
  })
}

UploadTask.prototype.stop = function () {
  this.cancel = true
}

function getSliceMD5 (fileName, index, start, end) {
  // todo 改md5
  let md5 = crypto.createHash('sha1')

  let readStream = fs.createReadStream(fileName, {
    start: start,
    end: end
  })

  return new Promise((resolve, reject) => {
    readStream.on('data', chunk => md5.update(chunk))

    readStream.on('error', reject)

    readStream.on('end', () => resolve({
      index,
      hash: md5.digest('hex'),
      length: end - start + 1,
      body: fs.createReadStream(fileName, {
        start: start,
        end: end
      })
    }))
  })
}

/**
 *
 * @param  {object}   file
 *     @param  {string}   file.fileName
 *     @param  {int}   file.fileSize
 *     @param  {int}   file.sliceSize
 */
function * getSliceIterator (file) {
  let start = 0
  let end = file.sliceSize - 1
  let index = 1

  while (end < file.fileSize - 1) {
    yield getSliceMD5(file.fileName, index, start, end)
    index++
    start = end + 1
    end += file.sliceSize
  }

  yield getSliceMD5(file.fileName, index, start, file.fileSize - 1)
}

function DownloadTask () {}

function MockTask (arg) {
  return Promise.resolve(arg)
}

MockTask.prototype.start = function () {
  return new Promise((resolve, reject) => {
    setTimeout(resolve(), 1000)
  })
}
