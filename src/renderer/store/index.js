import Vue from 'vue'
import Vuex from 'vuex'

import modules from './modules'
import { actions, state, mutations } from './actions'

Vue.use(Vuex)

export default new Vuex.Store({
  actions,
  state,
  mutations,
  modules,
  strict: process.env.NODE_ENV !== 'production'
})
