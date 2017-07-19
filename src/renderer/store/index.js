import Vue from 'vue'
import Vuex from 'vuex'

import modules from './modules'
import { actions, state, mutations ,getters } from './actions'



Vue.use(Vuex)


export default new Vuex.Store({
  actions,
  state,
  getters,
  mutations,
  modules,
  strict: process.env.NODE_ENV !== 'production'
})
