/**
 * Created by gokuai on 17/6/26.
 */

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
  }
}

const actions = {
  getService ({commit, rootGetters}) {
    return new Promise((resolve, reject) => {
      rootGetters.userConfig.cos.getService(function (err, data) {
        if (!err) {
          let reName = '-' + rootGetters.userConfig.cos.AppId
          data.Buckets.map(function (b) {
            b.active = false
            b.Name = b.Name.replace(reName, '')
            return b
          })
          commit('getMuService', data.Buckets)
          resolve()
        } else {
          reject(err)
        }
      })
    })
  },
  putBucket ({commit, rootGetters}, params) {
    return new Promise((resolve, reject) => {
      console.log(params.pms)
      rootGetters.userConfig.cos.putBucket(params.pms, function (err, data) {
        if (!err) {
          resolve()
        } else {
          reject(err)
        }
      })
    })
  },
  deleteBucket ({commit, rootGetters}, params) {
    return new Promise((resolve, reject) => {
      console.log(params)
      rootGetters.userConfig.cos.deleteBucket(params.pms, function (err, data) {
        if (!err) {
          resolve()
        } else {
          reject(err)
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
