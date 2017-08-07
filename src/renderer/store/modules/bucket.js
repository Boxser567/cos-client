/**
 * Created by gokuai on 17/6/26.
 */

import sdkUtil from 'cos-nodejs-sdk-v5/sdk/util'

const state = {
  bucketList: null
}

const mutations = {
  getMuService (state, Buckets) {
    for (let bkt of Buckets) {
      let ss = bkt.Name.split('-')
      bkt.Name = ss[0]
      bkt.AppId = ss[1]
      bkt.active = false
    }
    state.bucketList = Buckets
  },

  bucketActive (state, bucketName) {
    state.bucketList.forEach(b => {
      b.active = b.Name === bucketName
    })
  }
}

const actions = {
  getAuth ({rootGetters}, param) {
    return Promise.resolve(sdkUtil.getAuth(param))
  },

  getService ({rootGetters, commit}) {
    return new Promise((resolve, reject) => {
      rootGetters.cos.getService((err, data) => {
        if (err) {
          rootGetters.bus.$emit('globleError', err)
          reject(err)
        } else {
          commit('getMuService', data.Buckets)
          resolve(data)
        }
      })
      // rootState.bus={type:'error',msg:'出错'}
    })
  },

  putBucket ({commit, rootGetters}, params) {
    return new Promise((resolve, reject) => {
      rootGetters.cos.putBucket(params.pms, function (err, data) {
        if (err) {
          rootGetters.bus.$emit('globleError', err)
          reject(err)
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
          rootGetters.bus.$emit('globleError', err)
          reject(err)
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
          rootGetters.bus.$emit('globleError', err)
          reject(err)
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
          rootGetters.bus.$emit('globleError', err)
          reject(err)
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
          rootGetters.bus.$emit('globleError', err)
          reject(err)
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
          rootGetters.bus.$emit('globleError', err)
          reject(err)
        } else {
          resolve(data)
        }
      })
    })
  },

  deleteBucketCORS ({rootGetters}, params) {
    return new Promise((resolve, reject) => {
      rootGetters.cos.deleteBucketCors(params, function (err, data) {
        if (err) {
          rootGetters.bus.$emit('globleError', err)
          reject(err)
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
          rootGetters.bus.$emit('globleError', err)
          reject(err)
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
          rootGetters.bus.$emit('globleError', err)
          reject(err)
        } else {
          resolve(data)
        }
      })
    })
  },

  putObject ({rootGetters}, params) {
    return new Promise((resolve, reject) => {
      params.Body = Buffer.from('')
      rootGetters.cos.putObject(params, function (err, data) {
        if (err) {
          rootGetters.bus.$emit('globleError', err)
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
