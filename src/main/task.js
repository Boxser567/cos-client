/**
 * Created by michael on 2017/7/3.
 */
'use strict'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import events from 'events'
import log from 'electron-log'

const CHECK_ETAG = true // 是否检查分片上传每片返回的ETag
/**
 * Enum for task status.
 * @readonly
 * @enum {string}
 */
const TaskStatus = {
  WAIT: 'wait',
  RUN: 'run',
  PAUSE: 'pause',
  COMPLETE: 'complete',
  ERROR: 'error'
}

function Tasks (max) {
  events.EventEmitter.call(this)
  let nextId = 0
  let maxActivity = max
  let activity = 0
  this.tasks = []
  this.getId = () => nextId++
  this.add = () => {
    if (activity < maxActivity) {
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
  this.full = () => activity >= max
  this.maxLim = (val) => {
    if (typeof val === 'number' && val) {
      if (val > maxActivity) {
        let c = val - maxActivity
        maxActivity = val
        while (c--) {
          this.next()
        }
        return maxActivity
      }
      maxActivity = val
      return maxActivity
    }
    return maxActivity
  }
  this.empty = () => activity === 0
  this.initRefresh()
}

Tasks.prototype = Object.create(events.EventEmitter.prototype)

Tasks.prototype.newTask = function (task) {
  let id = this.getId()
  task.id = id
  task.status = TaskStatus.WAIT
  this.tasks[id] = task
  this.emit('new', task)
}

Tasks.prototype.findTask = function (id) {
  return this.tasks[id]
}

Tasks.prototype.deleteTask = function (id) {
  let t = this.tasks[id]
  delete this.tasks[id]
  return t
}

Tasks.prototype.next = async function () {
  if (!this.add()) return
  // 保证emit不会产生异常导致done丢失
  try {
    for (let task of this.tasks) {
      if (!task || task.status !== TaskStatus.WAIT) continue
      task.status = TaskStatus.RUN
      try {
        let result = await task.start()
        task.status = TaskStatus.COMPLETE
        this.emit('done', task, result)
      } catch (err) {
        if (err.message === 'cancel') {
          task.status = TaskStatus.PAUSE
          this.emit('cancel', task)
        } else {
          task.status = TaskStatus.ERROR
          this.emit('error', task, err)
        }
      }
      task.modify = true
    }
  } finally {
    this.done()
  }
}

Tasks.prototype.initRefresh = function () {
  let refresh = false
  let force
  let count = 10
  this.refresher = setInterval(() => {
    count--
    if ((!refresh && this.empty()) || (!force && count > 0)) return

    refresh = false
    force = false
    count = 10
    let s = []
    this.tasks.forEach(t => {
      s.push(Object.assign({
        id: t.id,
        status: t.status,
        modify: t.modify
      }, t.exports()))
      t.modify = false
    })
    this.emit('refresh', s)
  }, 200)

  this.on('new', () => { refresh = true })
  this.on('done', () => { refresh = true })
  this.on('error', () => { refresh = true })
  this.on('cancel', () => { refresh = true })

  this.refresh = () => {
    force = true
    refresh = true
  }
}

/**
 * 对指定task发出pause指令
 * @param {int[]}   tasks
 * @param {boolean} all
 * @param {boolean} wait
 */
Tasks.prototype.pause = function (tasks, all, wait) {
  let fn = (task) => {
    if (!task) return
    switch (task.status) {
      case TaskStatus.RUN:
        task.modify = true
        task.stop()
        task.status = wait ? TaskStatus.WAIT : TaskStatus.PAUSE
        break
      case TaskStatus.WAIT:
        if (!wait) {
          task.modify = true
          task.status = TaskStatus.PAUSE
        }
        break
      case TaskStatus.PAUSE:
        if (wait) {
          task.modify = true
          task.status = TaskStatus.WAIT
        }
        break
      case TaskStatus.COMPLETE:
      case TaskStatus.ERROR:
    }
  }
  if (all) {
    this.tasks.forEach(fn)
  } else {
    tasks.forEach(id => {
      fn(this.findTask(id))
    })
  }
  this.refresh(true)
}

/**
 * 对指定task发出resume指令
 * @param {int[]}   tasks
 * @param {boolean} all
 */
Tasks.prototype.resume = function (tasks, all) {
  let fn = (task) => {
    if (!task) return
    switch (task.status) {
      case TaskStatus.ERROR:
      case TaskStatus.PAUSE:
        task.modify = true
        task.status = TaskStatus.WAIT
        break
      case TaskStatus.WAIT:
      case TaskStatus.RUN:
      case TaskStatus.COMPLETE:
    }
    this.next()
  }
  if (all) {
    this.tasks.forEach(fn)
  } else {
    tasks.forEach(id => {
      fn(this.findTask(id))
    })
  }
  this.refresh(true)
}

/**
 * 对指定task发出delete指令
 * @param {int[]}   tasks
 * @param {boolean} all
 * @param {boolean} onlyComplete
 * @param {boolean} onlyNotComplete
 */
Tasks.prototype.delete = function (tasks, all, onlyComplete, onlyNotComplete) {
  let fn = (task) => {
    if (!task) return
    switch (task.status) {
      case TaskStatus.COMPLETE:
        if (!onlyNotComplete) {
          this.deleteTask(task.id)
        }
        return
      case TaskStatus.RUN:
        if (!onlyComplete) {
          task.stop()
          this.deleteTask(task.id)
        }
        return
      case TaskStatus.WAIT:
      case TaskStatus.PAUSE:
      case TaskStatus.ERROR:
        if (!onlyComplete) {
          this.deleteTask(task.id)
        }
    }
  }
  if (all) {
    this.tasks.forEach(fn)
  } else {
    tasks.forEach(id => {
      fn(this.findTask(id))
    })
  }
  this.refresh(true)
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
 * @param  {string}   [params.UploadId] 仅续传任务需要
 *
 * @param  {object}   [option]
 * @param  {int}      option.sliceSize
 * @param  {int}      option.asyncLim
 */
function UploadTask (cos, name, params, option = {}) {
  this.cos = cos
  this.params = params
  this.file = {}
  this.progress = {list: [], loaded: 0, total: 0}
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
      this.progress.total = this.file.fileSize
      while (n > this.file.sliceSize) {
        this.progress.list.push({total: this.file.sliceSize})
        n -= this.file.sliceSize
      }
      this.progress.list.push({total: n})

      if (this.file.fileSize !== 0) {
        this.file.iterator = getSliceIterator(this.file)
      }

      let time0 = Date.now()
      let loaded0 = 0
      this.progress.On = () => {
        let time1 = Date.now()
        if (time1 < time0 + 100) return
        setImmediate(() => {
          let loaded1 = 0
          this.progress.list.forEach(piece => {
            loaded1 += piece.loaded || 0
          })
          this.progress.speed = parseInt((loaded1 - loaded0) * 1000 / (time1 - time0))
          this.progress.loaded = loaded1
          time0 = time1
          loaded0 = loaded1
        })
      }

      resolve(this)
    })
  })
}

// todo 添加校验
UploadTask.prototype.start = function () {
  this.cancel = false
  if (this.file.fileSize === 0) {
    return new Promise((resolve, reject) => {
      this.params.Body = Buffer.from('')
      this.cos.putObject(this.params, (err, data) => {
        err ? reject(Object.assign(err, {params: this.params})) : resolve(data)
      })
    })
  }

  return (this.params.UploadId ? this.getMultipartListPart() : this.multipartInit())
    .then(::this.uploadSlice)
    .then(::this.multipartComplete)
    .catch(err => {
      err.params = this.params
      throw err
    })
}

UploadTask.prototype.multipartInit = function () {
  return new Promise((resolve, reject) => {
    this.cos.multipartInit(this.params, (err, result) => {
      if (err) { return reject(err) }
      if (!result.UploadId) { return reject(new Error('null UploadId')) }
      log.debug('sliceUploadFile: 创建新上传任务成功，UploadId: ', result.UploadId)
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

/** @private */
UploadTask.prototype.uploadSlice = function () {
  return Promise.all(new Array(this.asyncLim).fill(0).map(() => this.upload()))
    .then(() => {
      this.progress.speed = 0
      return Promise.resolve()
    })
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
      log.debug('upload: 秒传', result.index, result.hash)
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
        if (data.ETag !== `"${result.hash}"`) {
          let e = new Error('ETag mismatch')
          e.PartNumber = result.index
          e.SrcMD5 = result.hash
          e.DstData = data
          if (CHECK_ETAG) {
            reject(e)
            return
          }
          log.warn(e)
        }
        if (this.cancel) {
          reject(new Error('cancel'))
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
    this.cos.multipartComplete(this.params, (err, result) => {
      err ? reject(err) : resolve(result)
    })
  })
}

UploadTask.prototype.stop = function () {
  this.cancel = true
}

UploadTask.prototype.exports = function () {
  return {
    Key: this.params.Key,
    Bucket: this.params.Bucket,
    Region: this.params.Region,
    FileName: this.file.fileName,
    size: this.progress.total,
    loaded: this.progress.loaded,
    speed: this.progress.speed
  }
}

function getSliceHash (fileName, index, start, end) {
  let hash = crypto.createHash('md5')

  let readStream = fs.createReadStream(fileName, {
    start: start,
    end: end
  })

  return new Promise((resolve, reject) => {
    readStream.on('data', chunk => hash.update(chunk))

    readStream.on('error', reject)

    readStream.on('end', () => resolve({
      index,
      hash: hash.digest('hex'),
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
function* getSliceIterator (file) {
  let start = 0
  let end = file.sliceSize - 1
  let index = 1

  while (end < file.fileSize - 1) {
    yield getSliceHash(file.fileName, index, start, end)
    index++
    start = end + 1
    end += file.sliceSize
  }

  yield getSliceHash(file.fileName, index, start, file.fileSize - 1)
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
 * @param  {string}   [params.UploadId] 仅续传任务需要
 *
 * @param  {object}   [option]
 * @param  {int}      option.sliceSize
 * @param  {int}      option.asyncLim
 */
function MockUploadTask (cos, name, params, option = {}) {
  this.params = params
  this.file = {
    fileName: name
  }
  this.asyncLim = 2
  this.cancel = false
  this.progress = {}
  this.progress.loaded = 0
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
      this.progress.total = stats.size
      resolve(this)
    })
  })
}

MockUploadTask.prototype.start = function () {
  return new Promise((resolve, reject) => {
    this.cancel = false
    let p = setInterval(() => {
      if (this.cancel) {
        this.progress.speed = 0
        clearInterval(p)
        reject(new Error('cancel'))
        return
      }
      this.progress.loaded += 20900
      this.progress.speed = 209000
      if (this.progress.loaded >= this.progress.total) {
        this.progress.loaded = this.progress.total
        this.progress.speed = 0
        clearInterval(p)
        resolve()
      }
    }, 100)
  })
}

MockUploadTask.prototype.stop = function () {
  this.cancel = true
}

MockUploadTask.prototype.exports = function () {
  return {
    Key: this.params.Key,
    Bucket: this.params.Bucket,
    Region: this.params.Region,
    FileName: this.file.fileName,
    size: this.progress.total,
    loaded: this.progress.loaded,
    speed: this.progress.speed
  }
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
 *
 * @param  {object}   [option]
 * @param  {int}      option.asyncLim
 */
function DownloadTask (cos, name, params, option = {}) {
  this.cos = cos
  this.params = {
    Bucket: params.Bucket,
    Region: params.Region,
    Key: params.Key
  }
  this.file = {
    fileName: name
  }
  this.progress = {loaded: 0, total: 0}
  this.cancel = false
  return new Promise((resolve, reject) => {
    this.cos.headObject(params, (err, result) => {
      if (err) {
        reject(err)
        return
      }
      this.file.fileSize = parseInt(result.headers['content-length'])
      this.progress.total = this.file.fileSize
      resolve(this)
    })
  })
}

DownloadTask.prototype.start = function () {
  this.cancel = false
  let {dir, root} = path.parse(this.file.fileName)
  dir.split(path.sep).reduce((parentDir, childDir) => {
    const curDir = path.resolve(parentDir, childDir)
    if (!fs.existsSync(curDir)) {
      fs.mkdirSync(curDir)
    }
    return curDir
  }, root)

  this.params.Output = fs.createWriteStream(this.file.fileName + '.tmp')

  let time0 = Date.now()
  let loaded0 = 0
  this.params.Output.on('drain', () => {
    this.progress.loaded = this.params.Output.bytesWritten
    let time1 = Date.now()
    let loaded1 = this.progress.loaded
    if (time1 > time0 + 100) {
      this.progress.speed = parseInt((loaded1 - loaded0) * 1000 / (time1 - time0))
    }
    if (this.cancel) {
      this.params.Output.close()
      this.params.Output.emit('error', new Error('cancel'))
    }
  })

  return new Promise((resolve, reject) => {
    this.cos.getObject(this.params, (err, result) => {
      err ? reject(err) : resolve(result)
    })
  }).then(() => {
    this.progress.speed = 0
    fs.renameSync(this.file.fileName + '.tmp', this.file.fileName)
    return Promise.resolve()
  }, (err) => {
    try {
      fs.unlinkSync(this.file.fileName + '.tmp')
    } catch (e) {}
    throw err
  })
}

DownloadTask.prototype.stop = function () {
  this.cancel = true
}

DownloadTask.prototype.exports = function () {
  return {
    Key: this.params.Key,
    FileName: this.file.fileName,
    size: this.progress.total,
    loaded: this.progress.loaded,
    speed: this.progress.speed
  }
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
 *
 * @param  {object}   [option]
 * @param  {int}      option.asyncLim
 */
function MockDownloadTask (cos, name, params, option = {}) {
  this.params = params
  this.file = {
    fileName: name
  }
  this.asyncLim = 2
  this.cancel = false
  this.progress = {}
  this.progress.total = 1 << 20
  this.progress.loaded = 0
  return Promise.resolve(this)
}

MockDownloadTask.prototype.start = function () {
  return new Promise((resolve, reject) => {
    this.cancel = false
    let p = setInterval(() => {
      if (this.cancel) {
        this.progress.speed = 0
        clearInterval(p)
        reject(new Error('cancel'))
        return
      }
      this.progress.loaded += 20900
      this.progress.speed = 209000
      if (this.progress.loaded >= this.progress.total) {
        this.progress.loaded = this.progress.total
        this.progress.speed = 0
        clearInterval(p)
        resolve()
      }
    }, 100)
  })
}

MockDownloadTask.prototype.stop = function () {
  this.cancel = true
}

MockDownloadTask.prototype.exports = function () {
  return {
    Key: this.params.Key,
    FileName: this.file.fileName,
    size: this.progress.total,
    loaded: this.progress.loaded,
    speed: this.progress.speed
  }
}

export { TaskStatus, Tasks, UploadTask, MockUploadTask, DownloadTask, MockDownloadTask }
