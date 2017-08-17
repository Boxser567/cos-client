/**
 * Created by michael on 2017/7/18.
 */
import Vue from 'vue'
import { ipcRenderer } from 'electron'
import Cos from 'cos-nodejs-sdk-v5'
import promisify from 'util.promisify'
import log from 'electron-log'

let cos = new Cos({})
let bus = new Vue()

export const state = {
  config: {
    cos: null
  },
  platform: 'other'
}

export const getters = {
  cos: state => {
    return cos
  },
  bus: state => {
    return bus
  }
}

export const mutations = {
  config ({config}, cfg) {
    config = Object.assign(config, cfg)
    if (cfg.cos) {
      cos.options.AppId = cfg.cos.AppId
      cos.options.SecretId = cfg.cos.SecretId
      cos.options.SecretKey = cfg.cos.SecretKey
    }
  },
  setPlatform(state, val){
    if (!val) return
    state.platform = val
  }
}

export const actions = {
  getConfig ({commit}) {
    commit('config', ipcRenderer.sendSync('GetConfig'))
  },

  setConfig ({commit, state}, config) {
    commit('config', config)
    ipcRenderer.send('SetConfig', state.config)
  },

  callCosApi (context, {api, params}) {
    return retry(::cos[api], params)
  },

  deleteObjects ({commit}, arg) {
    let del = (Key) => {
      return () => {
        let params = {
          Bucket: arg.Bucket,
          Region: arg.Region,
          Key
        }
        return promisify(::cos.deleteObject)(params)
          .catch(err => Promise.reject(Object.assign(err, {params})))
      }
    }

    if (arg.Keys.length === 1 && arg.Dirs.length === 0) {
      return task(del(arg.Keys[0]))
    }

    return batch(arg, 'delete', ({Key}) => del(Key))
  },

  copyObjects ({commit}, arg) {
    Object.assign(arg, arg.src)

    let copy = (Key) => {
      let item = Key.substr(arg.src.Prefix.length)
      return () => {
        if (Key.substr(-1) === '/') {
          let params = {
            Bucket: arg.dst.Bucket,
            Region: arg.dst.Region,
            Key: arg.dst.Prefix + item,
            Body: Buffer.from('')
          }
          return promisify(::cos.putObject)(params)
            .catch(err => Promise.reject(Object.assign(err, {params})))
        }
        let params = {
          Bucket: arg.dst.Bucket,
          Region: arg.dst.Region,
          Key: arg.dst.Prefix + item,
          CopySource: encodeURIComponent(`${arg.src.Bucket}-${cos.options.AppId}.${arg.src.Region}.myqcloud.com/${Key}`)
        }
        return promisify(::cos.putObjectCopy)(params)
          .catch(err => Promise.reject(Object.assign(err, {params})))
      }
    }

    if (arg.Keys.length === 1 && arg.Dirs.length === 0) {
      return task(copy(arg.Keys[0]))
    }

    return batch(arg, 'copy', ({Key}) => copy(Key))
  },

  changeObjectsAcl ({commit}, arg) {
    // todo
    batch(arg, 'acl', ({Key}) => {
      return () => {
        return new Promise((resolve, reject) => {
          let params = {}

          cos.deleteObject(params, (err, data) => {
            err ? reject(Object.assign(err, {params})) : resolve(data)
          })
        })
      }
    })
  },

  debug ({commit}, arg) {
    batch(arg, 'debug', (k) => {
      return () => {
        return new Promise((resolve, reject) => {
          if (Math.random() > 0.5) {
            setTimeout(resolve, 700)
            return
          }
          setTimeout(() => {
            let err = new Error(k + ' error')
            err.params = arg
            err.params.Key = k
            reject(err)
          }, 700)
        })
      }
    })
  }
}

function normalizeError (err) {
  if (err instanceof Error) return err
  if (!err.error) {
    let e = new Error('unknown')
    e.error = err
    return e
  }
  if (typeof err.error === 'string') {
    let e = new Error(err.error)
    e.error = err
    return e
  }
  if (err.error instanceof Error) {
    let e = err.error
    e.error = err
    return e
  }
  if (typeof err.error.Message === 'string') {
    let e = new Error(err.error.Message)
    e.error = err
    return e
  }
}

async function retry (fn, params, times = 3) {
  let err
  for (; times > 0; times--) {
    try {
      return await promisify(fn)(params)
    } catch (e) {
      err = normalizeError(e)
      if (times > 1) log.warn(err)
    }
  }
  err.params = params
  log.error(err)
  bus.$emit('globleError', err)
  throw err
}

async function batch (arg, type, fn) {
  let cancel = false
  let msg = {
    type,
    action: 'open',
    data: {},
    cancel () {
      cancel = true
    }
  }
  bus.$emit('batch', msg)

  // 获取列表
  let contents = await getContents({
    Bucket: arg.Bucket,
    Region: arg.Region
  }, arg.Keys, arg.Dirs)

  msg.action = 'data'
  msg.data = {
    done: 0,
    total: contents.length
  }

  bus.$emit('batch', msg)

  for (let content of contents) {
    if (cancel) break
    try {
      await task(fn(content))
      msg.data.done++
      bus.$emit('batch', msg)
    } catch (err) {
      // todo 用户选择终止
      break
    }
  }
  msg.action = 'finish'
  bus.$emit('batch', msg)
}

async function task (fn) {
  do {
    try {
      await fn()
      break
    } catch (e) {
      if (await confirm(e)) break
    }
  } while (true)
}

async function confirm (error) {
  return new Promise((resolve, reject) => {
    bus.$emit('confirm', {
      error,
      retry () { resolve(false) },
      stop () { reject(new Error('stop')) },
      ignore () { resolve(true) }
    })
  })
}

async function getContents (params, keys, dirs) {
  let contents = []
  if (keys) {
    contents = contents.concat(keys.map(k => ({Key: k})))
  }

  for (let dir of dirs) {
    params.Prefix = dir
    let result
    do {
      console.log('params', params)
      result = await promisify(::cos.getBucket)(params)
      contents = contents.concat(result.Contents)
      params.Marker = result.NextMarker
    } while (result.IsTruncated === 'true')
    params.Marker = ''
  }
  return contents
}
