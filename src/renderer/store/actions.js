/**
 * Created by michael on 2017/7/18.
 */
import { ipcRenderer } from 'electron'
import { cos } from '../cos'

export const plugins = [
  store => {
    store.subscribe(({type}, {config}) => {
      if (type === 'config') {
        cos.options = config.cos
      }
    })
  }
]

export const actions = {
  getConfig ({commit}) {
    commit('config', ipcRenderer.sendSync('GetConfig'))
  },
  setConfig ({commit, state}, config) {
    commit('config', config)
    ipcRenderer.send('SetConfig', state.config)
  }
}
