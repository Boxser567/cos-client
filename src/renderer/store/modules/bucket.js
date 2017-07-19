/**
 * Created by gokuai on 17/6/26.
 */
import { ipcRenderer } from 'electron'

const state = {
  bucketList: null,
  currentBucket: null
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

  currentBucket(state, val) {
    state.currentBucket = val
  }

}

const actions = {
  // cosSetting({commit, rootGetters}, params){
  //   return new Promise((resolve, reject) => {
  //     rootGetters.cos.putBucket(params.pms, function (err, data) {
  //       if (err) {
  //         // cos.bus.$emit('globleError', err)
  //         return
  //       } else {
  //         resolve(data)
  //       }
  //     })
  //   })
  // },

  getService ({commit, rootGetters, rootState}) {
    return new Promise((resolve, reject) => {
      console.log('rootGetter', rootGetters, rootState)

      ipcRenderer.send('ListBucket')

      ipcRenderer.once('ListBucket-data', function (event, data) {
        commit('getMuService', data)
        resolve(data)
      })

    })
  },
  putBucket ({commit, rootGetters}, params) {
    return new Promise((resolve, reject) => {

      rootGetters.cos.putBucket(params.pms, function (err, data) {
        if (err) {
          // cos.bus.$emit('globleError', err)
          return
        } else {
          resolve(data)
        }
      })
      // ipcRenderer.send('PutBucket', params.pms)
      //
      // ipcRenderer.once('PutBucket-data', function (event, data) {
      //   resolve(data)
      // })
      //
      // ipcRenderer.once('PutBucket-error', function (event, err) {
      //   reject(err)
      // })
    })
  },
  deleteBucket ({state}) {
    return new Promise((resolve, reject) => {
      rootGetters.cos.deleteBucket(state.currentBucket, function (err, data) {
        if (err) {
          cos.bug.$emit('globleError', err)
          return
        } else {
          resolve(data)
        }
      })

      // ipcRenderer.send('DeleteBucket', state.currentBucket)
      //
      // ipcRenderer.once('DeleteBucket-data', function (event, data) {
      //   resolve(data)
      // })
      //
      // ipcRenderer.once('DeleteBucket-error', function (event, err) {
      //   reject(err)
      // })
    })
  },
  headObject ({commit}, params) {
    return new Promise((resolve, reject) => {

    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
