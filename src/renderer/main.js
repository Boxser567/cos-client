import Vue from 'vue'
import axios from 'axios'
import ElementUI from 'element-ui'
import elem from 'element-ui/lib/index'
import App from './App'
import router from './router'
import store from './store'

import myfilte from './assets/js/filters'

Vue.use(ElementUI)
Vue.use(elem)     //饿了么组件引用

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

// filter 挂载到全局
Object.keys(myfilte).forEach(function (key) {
  Vue.filter(key, myfilte[key])
})

/* eslint-disable no-new */
new Vue({
  components: {App},
  router,
  store,
  template: '<App/>'
}).$mount('#app')
