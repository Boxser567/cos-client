/**
 * Created by gokuai on 17/6/26.
 */
import { ipcRenderer } from 'electron'

const state = {
  bucketList: [],
  currentBucket: null,
  menu: {
    viewMenu: false,
    top: '0px',
    left: '0px'
  }

}

const mutations = {
  getMuService (state, data) {
    state.bucketList = data
  },
  bucketActive (state, index) {
    state.bucketList.forEach(function (a, i) {
      a.active = false
      if (i === index) {
        a.active = true
        state.currentBucket = a
      }
    })
  },
  currentBucket (state, val) {
    state.currentBucket = val
  }
}

const actions = {
  getService ({commit}) {
    return new Promise((resolve, reject) => {
      ipcRenderer.send('ListBucket')

      ipcRenderer.once('ListBucket-data', function (event, data) {
        let list = []
        if (data.length) {
          list = data.map(function (b) {
            b.active = false
            return b
          })
        }
        commit('getMuService', list)
        resolve()
      })

      ipcRenderer.once('ListBucket-error', function (event, err) {
        console.log(err)
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
