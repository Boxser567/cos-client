/**
 * Created by gokuai on 17/6/26.
 */
import { ipcRenderer } from 'electron'

const state = {
  bucketList: null,
  currentBucket: null,
  menu: {
    viewMenu: false,
    top: '0px',
    left: '0px'
  },

}

const mutations = {
  getMuService (state, data) {
    console.log('bucket列表', data)
    for (let key in data) {
      data[key].forEach(n => n.active = false)
    }
    state.bucketList = data
  },

  bucketActive (state, bucketName) {
    for (let key in state.bucketList) {
      state.bucketList[key].forEach(x => {
        if (x.Name === bucketName) {
          x.active = true
        } else {
          x.active = false
        }
      })
    }
  },

  currentBucket
    (state, val)
  {
    state.currentBucket = val
  }

}

const actions = {
  getService ({commit}) {
    return new Promise((resolve, reject) => {
      ipcRenderer.send('ListBucket')

      ipcRenderer.once('ListBucket-data', function (event, data) {
        commit('getMuService', data)
        resolve(data)
      })

      ipcRenderer.once('ListBucket-error', function (event, err) {
        reject(err)
      })
    })
  },
  headBucket ({commit}, params) {
    return new Promise((resolve, reject) => {
      ipcRenderer.send('HeadBucket', params.pms)

      ipcRenderer.once('HeadBucket-data', function (event, data) {
        resolve(data)
      })

      ipcRenderer.once('HeadBucket-error', function (event, err) {
        reject(err)
      })
    })
  },
  putBucket ({commit}, params) {
    return new Promise((resolve, reject) => {
      ipcRenderer.send('PutBucket', params.pms)

      ipcRenderer.once('PutBucket-data', function (event, data) {
        resolve(data)
      })

      ipcRenderer.once('PutBucket-error', function (event, err) {
        reject(err)
      })
    })
  },
  deleteBucket ({state}) {
    return new Promise((resolve, reject) => {
      ipcRenderer.send('DeleteBucket', state.currentBucket)

      ipcRenderer.once('DeleteBucket-data', function (event, data) {
        resolve(data)
      })

      ipcRenderer.once('DeleteBucket-error', function (event, err) {
        reject(err)
      })
    })
  },
  headObject ({commit}, params) {
    return new Promise((resolve, reject) => {
      ipcRenderer.send('HeadObject', params.pms)

      ipcRenderer.once('HeadObject-data', function (event, data) {
        resolve(data)
      })

      ipcRenderer.once('HeadObject-error', function (event, err) {
        reject(err)
      })
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
