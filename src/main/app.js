/**
 * Created by michael on 2017/6/29.
 */
'use strict'
import fs from 'fs'
import path from 'path'
import { ipcMain } from 'electron'
import log from 'electron-log'
import Cos from 'cos-nodejs-sdk-v5'
import { MockDownloadTask as DownloadTask, MockUploadTask as UploadTask, Tasks } from './task'
import { clear, init, save } from './db'

log.transports.console.level = 'info'
log.transports.file.level = 'info'

let app

/**
 * 单例类，在应用初始化时初始化config，在窗口创建时初始化uploads和downloads，
 * 窗口关闭时config，uploads，downloads记录数据库，但不清除。
 */
function App () {
  if (app) return app
  app = this
  app.init()
}

App.prototype.init = async function () {
  /** @type {Tasks} */
  let uploads
  /** @type {Tasks} */
  let downloads

  let config = await init.config()

  let cos

  ipcMain.on('SetConfig', (event, cfg) => {
    config = cfg
    cos = new Cos(cfg.cos)
  })

  ipcMain.on('GetConfig', (event) => {
    if (config.cos) {
      cos = new Cos(config.cos)
    }
    event.returnValue = config
  })

  ipcMain.on('ClearAll', () => {
    config = {}
    uploads = null
    downloads = null
    clear()
  })

  ipcMain.on('ListBucket', (event) => {
    cos.getService((err, data) => {
      if (err) {
        try {
          event.sender.send('error', normalizeError(err, 'ListBucket'))
        } catch (err) {
          log.warn(err)
        }
        return
      }
      let result = {}
      data.Buckets.forEach(v => {
        let ss = v.Name.split('-')
        v.Name = ss[0]
        v.AppId = ss[1]
        config.cos.AppId = v.AppId
        cos.options.AppId = v.AppId
        if (Array.isArray(result[v.AppId])) {
          result[v.AppId].push(v)
        } else {
          result[v.AppId] = [v]
        }
      })
      try {
        event.sender.send('ListBucket-data', result)
      } catch (err) {
        log.warn(err)
      }
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
      data => event.sender.send('ListObject-data', data),
      err => {
        log.error(err)
        event.sender.send('error', normalizeError(err, 'ListObject'))
      }
    ).catch(err => { log.warn(err) })
  })

  ipcMain.on('DeleteObject', async (event, arg) => {
    /**
     * @param  {object}    arg
     * @param  {string}    arg.Bucket
     * @param  {string}    arg.Region
     * @param  {string[]}  [arg.Keys]  文件删除
     * @param  {string[]}  [arg.Dirs]  文件夹删除
     */

    let params = {
      Bucket: arg.Bucket,
      Region: arg.Region
    }

    async function fn (contents) {
      for (let item of contents) {
        try {
          await deleteObject(cos, {
            Bucket: arg.Bucket,
            Region: arg.Region,
            Key: item.Key
          })
        } catch (err) {
          try {
            log.error(err)
            event.sender.send('error', normalizeError(err, 'DeleteObject'))
          } catch (err) {
            log.warn(err)
          }
        }
      }
    }

    if (arg.Keys) {
      await fn(arg.Keys.map(k => ({Key: k})))
    }

    for (let dir of arg.Dirs) {
      params.Prefix = dir
      let result
      do {
        result = await getBucket(cos, params)
        await fn(result.Contents)
        params.Marker = result.NextMarker
      } while (result.IsTruncated === 'true')
    }
  })

  ipcMain.on('CopyObjects', async (event, arg) => {
    /**
     * @param  {object}    arg
     * @param  {object}    arg.src
     * @param  {string}    arg.src.Bucket
     * @param  {string}    arg.src.Region
     * @param  {string}    arg.src.Prefix
     * @param  {object}    arg.dst
     * @param  {string}    arg.dst.Bucket
     * @param  {string}    arg.dst.Region
     * @param  {string}    arg.dst.Prefix
     * @param  {string[]}  [arg.Keys]     文件复制
     * @param  {string[]}  [arg.Dirs]     文件夹复制
     */

    if (arg.dst.Prefix !== '') {
      arg.dst.Prefix = arg.dst.Prefix.substr(-1) === '/' ? arg.dst.Prefix : arg.dst.Prefix + '/'
    }

    async function fn (contents) {
      for (let item of copyGenerator(arg.src.Prefix, contents)) {
        try {
          await putObjectCopy(cos, {
            Bucket: arg.dst.Bucket,
            Region: arg.dst.Region,
            Key: arg.dst.Prefix + item,
            CopySource: `${arg.src.Bucket}-${cos.options.AppId}.${arg.src.Region}.myqcloud.com/${arg.src.Prefix + item}`
          })
        } catch (err) {
          try {
            log.error(err)
            event.sender.send('error', normalizeError(err, 'CopyObjects'))
          } catch (err) {
            log.warn(err)
          }
        }
      }
    }

    if (arg.Keys) {
      await fn(arg.Keys.map(k => ({Key: k, Size: '1'})))
    }

    let params = {
      Bucket: arg.src.Bucket,
      Region: arg.src.Region
    }

    for (let dir of arg.Dirs) {
      params.Prefix = dir
      let result
      do {
        result = await getBucket(cos, params)
        await fn(result.Contents)
        params.Marker = result.NextMarker
      } while (result.IsTruncated === 'true')
    }
  })

  ipcMain.on('GetUploadTasks', async (event) => {
    if (uploads) {
      uploads.removeAllListeners('refresh')
      uploads.on('refresh', (data) => {
        try {
          event.sender.send('GetUploadTasks-data', data)
        } catch (err) {
          log.warn(err)
          uploads.removeAllListeners('refresh')
        }
      })
      uploads.refresh()
      return
    }
    uploads = new Tasks(3)

    uploads.on('done', (task, result) => {
      task.progress.loaded = task.progress.total
      log.info('task done', task.params.Key)
    })

    uploads.on('cancel', (task, result) => {
      log.info('task cancel', task.params.Key)
    })

    uploads.on('error', (task, err) => {
      log.error(err)
    })

    uploads.on('refresh', (data) => {
      try {
        event.sender.send('GetUploadTasks-data', data)
      } catch (err) {
        log.warn(err)
        uploads.removeAllListeners('refresh')
      }
    })

    let tasks = await init.upload()
    for (let t of tasks) {
      try {
        let task = await new UploadTask(cos, t.name, t.params, t.option)
        uploads.newTask(task)
        task.progress.loaded = t.loaded
        task.progress.total = t.total
        task.status = t.status
      } catch (err) {
        log.error(err)
      }
    }
    uploads.refresh()
  })

  ipcMain.on('NewUploadTasks', async (event, arg) => {
    /**
     * @param  {object}   arg
     * @param  {string}   arg.Bucket
     * @param  {string}   arg.Region
     * @param  {string}   arg.Prefix
     * @param  {string[]} arg.FileNames
     */
    for (let name of arg.FileNames) {
      for (let item of uploadGenerator(name, arg.Prefix)) {
        try {
          let task = await new UploadTask(cos, item.name, {
            Bucket: arg.Bucket,
            Region: arg.Region,
            Key: item.key
          })
          uploads.newTask(task)
        } catch (err) {
          log.error(err)
        }
        uploads.next()
      }
    }
    uploads.refresh()
  })

  ipcMain.on('PauseUploadTasks', (event, arg) => {
    /**
     * @param {object}  arg
     * @param {int[]}   arg.tasks
     * @param {boolean} arg.all
     * @param {boolean} arg.wait
     */
    uploads.pause(arg.tasks, arg.all, arg.wait)
  })

  ipcMain.on('ResumeUploadTask', (event, arg) => {
    /**
     * @param {object}  arg
     * @param {int[]}   arg.tasks
     * @param {boolean} arg.all
     */
    uploads.resume(arg.tasks, arg.all)
  })

  ipcMain.on('DeleteUploadTasks', (event, arg) => {
    /**
     * @param {object}  arg
     * @param {int[]}   arg.tasks
     * @param {boolean} arg.all
     * @param {boolean} arg.onlyComplete
     * @param {boolean} arg.onlyNotComplete
     */
    uploads.delete(arg.tasks, arg.all, arg.onlyComplete, arg.onlyNotComplete)
  })

  ipcMain.on('GetDownloadTasks', async (event) => {
    if (downloads) {
      downloads.removeAllListeners('refresh')
      downloads.on('refresh', (data) => {
        try {
          event.sender.send('GetDownloadTasks-data', data)
        } catch (e) {
          log.warn(e)
        }
      })
      downloads.refresh()
      return
    }
    downloads = new Tasks(3)

    downloads.on('done', (task, result) => {
      task.progress.loaded = task.progress.total
      log.info('task done', task.params.Key)
    })

    downloads.on('cancel', (task, result) => {
      log.info('task cancel', task.params.Key)
    })

    downloads.on('error', (task, err) => {
      log.error(err)
    })

    downloads.on('refresh', (data) => {
      try {
        event.sender.send('GetDownloadTasks-data', data)
      } catch (e) {
        log.warn(e)
      }
    })

    let tasks = await init.download()
    for (let t of tasks) {
      try {
        let task = await new DownloadTask(cos, t.name, t.params, t.option)
        downloads.newTask(task)
        task.progress.loaded = t.loaded
        task.progress.total = t.total
        task.status = t.status
      } catch (e) {
        log.error(e)
      }
    }
    downloads.refresh()
  })

  ipcMain.on('NewDownloadTasks', async (event, arg) => {
    /**
     * @param  {object}    arg
     * @param  {string}    arg.Bucket
     * @param  {string}    arg.Region
     * @param  {string}    arg.Path     本地路径
     * @param  {string}    arg.Prefix   远程路径
     * @param  {string[]}  [arg.Keys]   文件下载
     * @param  {string[]}  [arg.Dirs]   文件夹下载
     */
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
          downloads.newTask(task)
          downloads.next()
        } catch (err) {
          log.error(err)
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
      } while (result.IsTruncated === 'true')
    }
    downloads.refresh()
  })

  ipcMain.on('PauseDownloadTasks', (event, arg) => {
    /**
     * @param {object}  arg
     * @param {int[]}   arg.tasks
     * @param {boolean} arg.all
     * @param {boolean} arg.wait
     */
    downloads.pause(arg.tasks, arg.all, arg.wait)
  })

  ipcMain.on('ResumeDownloadTask', (event, arg) => {
    /**
     * @param {object}  arg
     * @param {int[]}   arg.tasks
     * @param {boolean} arg.all
     */
    downloads.resume(arg.tasks, arg.all)
  })

  ipcMain.on('DeleteDownloadTasks', (event, arg) => {
    /**
     * @param {object}  arg
     * @param {int[]}   arg.tasks
     * @param {boolean} arg.all
     * @param {boolean} arg.onlyComplete
     * @param {boolean} arg.onlyNotComplete
     */
    downloads.delete(arg.tasks, arg.all, arg.onlyComplete, arg.onlyNotComplete)
  })

  this.close = function () {
    if (!uploads || !downloads) return Promise.resolve()
    uploads.pause([], true)
    downloads.pause([], true)
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
    let dir = src.pop()
    let subsrc = []
    for (let name of fs.readdirSync(dir)) {
      name = path.join(dir, name)
      if (fs.statSync(name).isDirectory()) {
        subsrc.unshift(name)
        continue
      }
      yield {name, key: prefix + name.substr(dirLen).replace('\\', '/')}
    }
    src.push(...subsrc)
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

function* copyGenerator (src, contents) {
  if (src !== '') {
    src = src.substr(-1) === '/' ? src : src + '/'
  }
  let slen = src.length
  for (let content of contents) {
    if (content.Size === '0') continue
    yield content.Key.substr(slen)
  }
}

function getBucket (cos, params) {
  return new Promise((resolve, reject) => {
    cos.getBucket(params, (err, data) => {
      err ? reject(err) : resolve(data)
    })
  })
}

function putObjectCopy (cos, params) {
  return new Promise((resolve, reject) => {
    cos.putObjectCopy(params, (err, data) => {
      err ? reject(err) : resolve(data)
    })
  })
}

function deleteObject (cos, params) {
  return new Promise((resolve, reject) => {
    cos.deleteObject(params, (err, data) => {
      err ? reject(err) : resolve(data)
    })
  })
}

function normalizeError (error, src) {
  if (error.error) {
    return {message: error.error.Message, src, error}
  }
  if (error.message) {
    return {message: error.message, src, error}
  }
  return {message: 'unknown', src, error}
}

export { App }
