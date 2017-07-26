/**
 * Created by michael on 2017/7/18.
 */
import Vue from 'vue'
import { ipcRenderer } from 'electron'
import Cos from 'cos-nodejs-sdk-v5'
let cos = new Cos({})
let bus = new Vue()

export const state = {
  config: {
    cos: null
  }
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
  deleteObjects ({commit}, arg) {
    let del = (Key) => {
      return () => {
        return new Promise((resolve, reject) => {
          let params = {
            Bucket: arg.Bucket,
            Region: arg.Region,
            Key
          }
          cos.deleteObject(params, (err, data) => {
            err ? reject(Object.assign(err, {params})) : resolve(data)
          })
        })
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
        return new Promise((resolve, reject) => {
          if (Key.substr(-1) === '/') {
            let params = {
              Bucket: arg.dst.Bucket,
              Region: arg.dst.Region,
              Key: arg.dst.Prefix + item,
              Body: Buffer.from('')
            }
            cos.putObject(params, (err, data) => {
              err ? reject(Object.assign(err, {params})) : resolve(data)
            })
            return
          }
          let params = {
            Bucket: arg.dst.Bucket,
            Region: arg.dst.Region,
            Key: arg.dst.Prefix + item,
            CopySource: encodeURIComponent(`${arg.src.Bucket}-${cos.options.AppId}.${arg.src.Region}.myqcloud.com/${Key}`)
          }
          cos.putObjectCopy(params, (err, data) => {
            err ? reject(Object.assign(err, {params})) : resolve(data)
          })
        })
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
      result = await getBucket(cos, params)
      contents = contents.concat(result.Contents)
      params.Marker = result.NextMarker
    } while (result.IsTruncated === 'true')
    params.Marker = ''
  }
  return contents
}

function getBucket (cos, params) {
  return new Promise((resolve, reject) => {
    cos.getBucket(params, (err, data) => {
      err ? reject(err) : resolve(data)
    })
  })
}
