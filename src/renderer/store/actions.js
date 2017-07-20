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
    cos.options.AppId = state.config.cos.AppId
    cos.options.SecretId = state.config.cos.SecretId
    cos.options.SecretKey = state.config.cos.SecretKey
    return cos
  },
  bus: state => {
    return bus
  }
}

export const mutations = {
  config ({config}, cfg) {
    for (let k in cfg) {
      if (cfg.hasOwnProperty(k)) {
        Vue.set(config, k, cfg[k])
        if (k === 'cos') {
          cos.options = cfg[k]
        }
      }
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
    bus.$emit('batch', {
      type: 'aa',
      action: 'open'
    })
  },
  debug () {
    batch('', 'delete')
  }
}

async function batch (arg, type) {
  bus.$emit('batch', {
    type,
    action: 'open'
  })

  // 获取列表
  // let contents = await getContents({
  //   Bucket: arg.Bucket,
  //   Region: arg.Region
  // }, arg.Keys, arg.Dirs)
  let contents = [0, 1, 2, 3, 4, 5]

  let done = 0

  bus.$emit('batch', {
    type,
    action: 'data',
    data: {
      done,
      total: contents.length
    }
  })

  for (let content of contents) {
    try {
      // await deleteObject(cos, {
      //   Bucket: arg.Bucket,
      //   Region: arg.Region,
      //   Key: content.Key
      // })
      await task(test(content))
      done++
      bus.$emit('batch', {
        type,
        action: 'data',
        data: {
          done,
          total: contents.length
        }
      })
    } catch (err) {
      // todo 用户选择终止
    }
  }

  bus.$emit('batch', {
    type,
    action: 'finish',
    data: {
      done,
      total: contents.length
    }
  })
}

// deleteObject(cos, {
//   Bucket: arg.Bucket,
//   Region: arg.Region,
//   Key: content.Key
// })
//
// function deleteObject (cos, params) {
//   return () => {
//     return new Promise((resolve, reject) => {
//       cos.deleteObject(params, (err, data) => {
//         err ? reject(err) : resolve(data)
//       })
//     })
//   }
// }

function test (content) {
  return () => {
    return new Promise((resolve, reject) => {
      if (Math.random() > 0.5) {
        setTimeout(resolve, 700)
        return
      }
      setTimeout(() => {
        let err = new Error(content + ' error')
        reject(err)
      }, 700)
    })
  }
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
    contents.concat(keys.map(k => ({Key: k})))
  }

  for (let dir of dirs) {
    params.Prefix = dir
    let result
    do {
      result = await
        getBucket(cos, params)
      contents.concat(result.Contents)
      params.Marker = result.NextMarker
    } while (result.IsTruncated === 'true')
    params.Marker = ''
  }
  return contents
}
