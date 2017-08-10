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

  getService ({commit, dispatch}) {
    return dispatch('callCosApi', {api: 'getService', params: {}}, {root: true}).then(
      data => { commit('getMuService', data.Buckets) }
    )
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
