/**
 * Created by gokuai on 17/6/26.
 */
import { ipcRenderer } from 'electron'
import {Buffer} from 'buffer'

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

  getService ({commit}) {
    return new Promise((resolve, reject) => {
      // rootState.bus={type:'error',msg:'出错'}

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
    })
  },

  deleteBucket ({state, rootGetters}, parms) {
    return new Promise((resolve, reject) => {
      rootGetters.cos.deleteBucket(parms, function (err, data) {
        if (err) {
          //cos.bug.$emit('globleError', err)
          return
        } else {
          resolve(data)
        }
      })
    })
  },

  getBucketACL ({rootGetters}, params) {
    return new Promise((resolve, reject) => {
      rootGetters.cos.getBucketACL(params, function (err, data) {
        if (err) {
          // cos.bus.$emit('globleError', err)
          return
        } else {
          resolve(data)
        }
      })
    })
  },

  putObject({rootGetters}, params){
    return new Promise((resolve, reject) => {
      // params.ContentLength = 0
      params.Body = new Buffer('')
      rootGetters.cos.putObject(params, function (err, data) {
        console.log(params, err)

        if (err) {
          // cos.bus.$emit('globleError', err)
          reject(err)
          return
        } else {
          resolve(data)
        }
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
