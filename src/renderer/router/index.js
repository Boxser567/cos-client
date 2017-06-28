import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  scrollBehavior: () => ({y: 0}),
  routes: [
    {
      path: '/',
      name: 'index-page',
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
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
