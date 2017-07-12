import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

let login

const router = new Router({
  scrollBehavior: () => ({y: 0}),
  routes: [
    {
      path: '/login',
      name: 'loginPage',
      component: require('@/components/login')
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
