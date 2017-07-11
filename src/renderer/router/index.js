import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)
const router = new Router({
  scrollBehavior: () => ({y: 0}),
  routes: [
    {
      path: '/login',
      meta: {
        loginAuth: true
      },
      name: 'loginPage',
      component: require('@/components/login')
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
// router.beforeEach((to, from, next) => {
//   let userC =localStorage.getItem('users')
//   if(userC){
//     next()
//   }else{
//     next('/login')
//   }
//   return
// })

export default router
