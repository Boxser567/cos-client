<template>
    <div class="slide-right">
        <div class="welcometo">
            欢迎初始化页面
        </div>
        <button @click="clicks">点我咯</button>
    </div>
</template>

<script>
  export default {
    name: 'container-page',
    data () {
      return {
        input1: ''
      }
    },
    methods: {
      clicks(){
        this.$store.dispatch('debug')
      }
    }
  }
</script>

<style lang="scss">
    @import "container.scss";
</style>
