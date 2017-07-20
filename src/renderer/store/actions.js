/**
 * Created by michael on 2017/7/18.
 */
import Vue from 'vue'
import { ipcRenderer } from 'electron'
// import { cos } from '../cos'

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
  config({config}, cfg){
    for (let k in cfg) {
      if (cfg.hasOwnProperty(k)) {
        Vue.set(config, k, cfg[k])
        if (k === 'cos') {
          cos.options = cfg[k]
        }
      }
    }
  },
  // changeBus(state, val){
  //   state.bus = val
  // }
}

export const actions = {
  getConfig ({commit}) {
    commit('config', ipcRenderer.sendSync('GetConfig'))
  },
  setConfig ({commit, state}, config) {
    commit('config', config)
    ipcRenderer.send('SetConfig', state.config)
  },
  debug () {
    bus.$emit('batch', {
      type: 'aa',
      action: 'open'
    })
  }
}







