/**
 * Created by gokuai on 17/7/3.
 */

const state = {
  options: {
    bucket: null,
    region: null,
    folders: null
  },
}
const mutations = {
  changeRoute(state, parms){
    if (!parms) return
    state.options = parms
    // state.options.bucket  = parms.options.bucket
    // state.options.region =parms.options.region
    // state
  },
  setFolder(state, val){
    state.options.folders = val
  }
}
const actions = {
  setFolder({commit}, val){
    if (!val) return
    commit('setFolder', val.val)
  },
  changeRoute({commit},parms){
    if(!parms) return
    commit('changeRoute',parms)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}