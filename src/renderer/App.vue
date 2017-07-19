<template>
    <div id="app">
        <router-view></router-view>
    </div>
</template>

<script>
//  import { cos } from  './cos'
  export default {
    name: 'gk-cos-client',
    computed: {
      bus () {
        return this.$store.getters.bus
      }
    },
    watch:{
      'bus':function () {
        console.log('busArgument',arguments)
      }
    },

    created () {
//      cos.bus.$on('globleError', (error) => {
//        this.$notify({
//          title: '提示',
//          message: error.message,
//          duration: 0
//        })
//      })
      this.$store.dispatch('getConfig')
      if (this.$store.state.config.cos) {
        this.$router.replace('/locked')
      } else {
        this.$router.replace('/login')
      }
    }
  }
</script>

<style>
    @import '../../node_modules/element-ui/lib/theme-default/index.css';
</style>
<style lang="scss">
    @import "./assets/style/globals.scss";
</style>