<template>
    <div id="app">
        <router-view></router-view>
    </div>
</template>

<script>
  import { ipcRenderer } from 'electron'
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
      this.$store.dispatch('getConfig')
      ipcRenderer.on('error', (event, error) => {
        this.$notify.error({
          title: 'Error',
          message: `无法${error.src}，因为${error.message}`
        })
      })
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