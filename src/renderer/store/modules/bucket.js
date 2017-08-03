/**
 * Created by gokuai on 17/6/26.
 */

import sdkUtil from 'cos-nodejs-sdk-v5/sdk/util'

const state = {
  bucketList: null
}

const mutations = {
  getMuService (state, Buckets) {
    console.log('bucket列表', Buckets)
    let appid = ''
    for (let bkt of Buckets) {
      let ss = bkt.Name.split('-')
      bkt.Name = ss[0]
      bkt.AppId = ss[1]
      appid = ss[1]
      bkt.active = false
    }
    let bucketList = {}
    bucketList[appid] = Buckets
    state.bucketList = bucketList
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

  getAuth ({rootGetters}, param) {
    return Promise.resolve(sdkUtil.getAuth(param))
  },

  getService ({rootGetters, commit}) {
    return new Promise((resolve, reject) => {
      rootGetters.cos.getService((err, data) => {
        if (err) {
          reject(err)
          return
        }
        commit('getMuService', data.Buckets)
        resolve(data)
      })
      // rootState.bus={type:'error',msg:'出错'}
    })
  },

  putBucket ({commit, rootGetters}, params) {
    return new Promise((resolve, reject) => {
      rootGetters.cos.putBucket(params.pms, function (err, data) {
        if (err) {
          // cos.bus.$emit('globleError', err)

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
          // cos.bug.$emit('globleError', err)

        } else {
          resolve(data)
        }
      })
    })
  },

  getBucketACL ({rootGetters}, params) {
    return new Promise((resolve, reject) => {
      rootGetters.cos.getBucketAcl(params, function (err, data) {
        if (err) {
          // cos.bus.$emit('globleError', err)
        } else {
          resolve(data)
        }
      })
    })
  },

  putBucketAcl ({rootGetters}, params) {
    return new Promise((resolve, reject) => {
      rootGetters.cos.putBucketAcl(params, function (err, data) {
        if (err) {
          console.log(3333, params, err)
          // rootGetters.cos.bus.$emit('globleError', err)
        } else {
          resolve(data)
        }
      })
    })
  },

  getBucketCORS ({rootGetters}, params) {
    return new Promise((resolve, reject) => {
      rootGetters.cos.getBucketCors(params, function (err, data) {
        if (err) {
          // rootGetters.cos.bus.$emit('globleError', err)
        } else {
          resolve(data)
        }
      })
    })
  },

  putBucketCORS ({rootGetters}, params) {
    return new Promise((resolve, reject) => {
      rootGetters.cos.putBucketCors(params, function (err, data) {
        if (err) {
          // rootGetters.cos.bus.$emit('globleError', err)
        } else {
          resolve(data)
        }
      })
    })
  },

  getObjectACL ({rootGetters}, params) {
    return new Promise((resolve, reject) => {
      rootGetters.cos.getObjectAcl(params, function (err, data) {
        if (err) {
          console.log(3333, params, err)
          // rootGetters.cos.bus.$emit('globleError', err)
        } else {
          resolve(data)
        }
      })
    })
  },

  putObjectACL ({rootGetters}, params) {
    return new Promise((resolve, reject) => {
      rootGetters.cos.putObjectAcl(params, function (err, data) {
        if (err) {
          console.log(3333, params, err)
          // rootGetters.cos.bus.$emit('globleError', err)
        } else {
          resolve(data)
        }
      })
    })
  },

  putObject ({dispatch, rootGetters}, params) {
    return new Promise((resolve, reject) => {
      params.Body = Buffer.from('')
      rootGetters.cos.putObject(params, function (err, data) {
        if (err) {
          // cos.bus.$emit('globleError', err)
          reject(err)
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
