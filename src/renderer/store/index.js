import Vue from 'vue'
import Vuex from 'vuex'

import {state, mutations} from './mutations'
import {actions, plugins} from './actions'
import modules from './modules'

Vue.use(Vuex)

export default new Vuex.Store({
  state,
  mutations,
  actions,
  modules,
  plugins,
  strict: process.env.NODE_ENV !== 'production'
})
