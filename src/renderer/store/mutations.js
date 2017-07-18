/**
 * Created by michael on 2017/7/18.
 */
import Vue from 'vue'
export const state = {
  config: {
    cos: null
  }
}

export const mutations = {
  config ({config}, cfg) {
    for (let k in cfg) {
      if (cfg.hasOwnProperty(k)) {
        Vue.set(config, k, cfg[k])
      }
    }
  }
}
