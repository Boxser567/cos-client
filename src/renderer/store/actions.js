/**
 * Created by michael on 2017/7/18.
 */
import Vue from 'vue'
import { ipcRenderer } from 'electron'
import { cos } from '../cos'

export const state = {
  config: {
    cos: null
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

  }
}
export const actions = {
  getConfig ({commit}) {
    commit('config', ipcRenderer.sendSync('GetConfig'))
  },
  setConfig ({commit, state}, config) {
    commit('config', config)
    ipcRenderer.send('SetConfig', state.config)
  }
}


