import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

const router = new Router({
  scrollBehavior: () => ({y: 0}),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: require('@/components/login')
    },
    {
      path: '/locked',
      name: 'locked',
      component: require('@/components/locked')
    },
    {
      path: '/',
      component: require('@/components/index'),
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
