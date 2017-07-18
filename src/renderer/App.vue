<template>
    <div id="app">
        <router-view></router-view>
    </div>
</template>

<script>
  export default {
    name: 'gk-cos-client',
    created () {
      this.$store.dispatch('getConfig')
      console.log(this.$store.state.config)
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