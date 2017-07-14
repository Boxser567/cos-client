import Vue from 'vue'
import Router from 'vue-router'
import { ipcRenderer } from 'electron'

Vue.use(Router)

let login

const router = new Router({
  scrollBehavior: () => ({y: 0}),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: require('@/components/login'),
      beforeEnter: (to, from, next) => {
        ipcRenderer.sendSync('LoginCheck') ? next() : next('/new')
      }
    },
    {
      path: '/locked',
      name: 'locked',
      component: require('@/components/locked')
    },
    {
      path: '/',
      component: require('@/components/index'),
      beforeEnter: (to, from, next) => {
        if (login) {
          next()
          return
        }
        login = true
        next('/login')
      },
      children: [
        {
          path: '',
          name: 'container-page',
          component: require('@/components/container/container')
        },
        {
          path: '/file/:bucket',
          name: 'filepage',
          component: require('@/components/modules/file')
        }
      ]
    }
  ]
})

export default router
