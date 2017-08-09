/**
 * Created by gokuai on 17/6/26.
 */
import sdkUtil from 'cos-nodejs-sdk-v5/sdk/util'
import log from 'electron-log'
import promisify from 'util.promisify'

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
    return promisify(::rootGetters.cos.getService)()
      .then(
        data => { commit('getMuService', data.Buckets) },
        err => {
          log.error(err)
          rootGetters.bus.$emit('globleError', err)
        }
      )
  },

  putBucket ({rootGetters}, params) {
    return promisify(::rootGetters.cos.putBucket)(params.pms)
      .catch(err => {
        err.params = params
        log.error(err)
        rootGetters.bus.$emit('globleError', err)
        return Promise.reject(err)
      })
  },

  deleteBucket ({rootGetters}, params) {
    return promisify(::rootGetters.cos.deleteBucket)(params)
      .catch(err => {
        err.params = params
        log.error(err)
        rootGetters.bus.$emit('globleError', err)
        return Promise.reject(err)
      })
  },

  getBucketACL ({rootGetters}, params) {
    return promisify(::rootGetters.cos.getBucketAcl)(params)
      .catch(err => {
        err.params = params
        log.error(err)
        rootGetters.bus.$emit('globleError', err)
        return Promise.reject(err)
      })
  },

  putBucketACL ({rootGetters}, params) {
    return promisify(::rootGetters.cos.putBucketAcl)(params)
      .catch(err => {
        err.params = params
        log.error(err)
        rootGetters.bus.$emit('globleError', err)
        return Promise.reject(err)
      })
  },

  getBucketCORS ({rootGetters}, params) {
    return promisify(::rootGetters.cos.getBucketCors)(params)
      .catch(err => {
        err.params = params
        log.error(err)
        rootGetters.bus.$emit('globleError', err)
        return Promise.reject(err)
      })
  },

  putBucketCORS ({rootGetters}, params) {
    return promisify(::rootGetters.cos.putBucketCors)(params)
      .catch(err => {
        err.params = params
        log.error(err)
        rootGetters.bus.$emit('globleError', err)
        return Promise.reject(err)
      })
  },

  deleteBucketCORS ({rootGetters}, params) {
    return promisify(::rootGetters.cos.deleteBucketCors)(params)
      .catch(err => {
        err.params = params
        log.error(err)
        rootGetters.bus.$emit('globleError', err)
        return Promise.reject(err)
      })
  },

  getObjectACL ({rootGetters}, params) {
    return promisify(::rootGetters.cos.getObjectAcl)(params)
      .catch(err => {
        err.params = params
        log.error(err)
        rootGetters.bus.$emit('globleError', err)
        return Promise.reject(err)
      })
  },

  putObjectACL ({rootGetters}, params) {
    return promisify(::rootGetters.cos.putObjectAcl)(params)
      .catch(err => {
        err.params = params
        log.error(err)
        rootGetters.bus.$emit('globleError', err)
        return Promise.reject(err)
      })
  },

  putObject ({rootGetters}, params) {
    params.Body = Buffer.from('')
    return promisify(::rootGetters.cos.putObject)(params)
      .catch(err => {
        err.params = params
        log.error(err)
        rootGetters.bus.$emit('globleError', err)
        return Promise.reject(err)
      })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
