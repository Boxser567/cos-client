<template>
    <div id="app" @dragover.prevent="onDragover" @drop.prevent="onDrop">
        <router-view></router-view>
    </div>
</template>

<script>
  export default {
    name: 'exitPage',
    created () {
    },
    data () {
      return {}
    },
    methods: {
      onDragover () {},
      onDrop () {}
    }
  }
</script>

<style>
    @import '../../node_modules/element-ui/lib/theme-default/index.css';
</style>
<style lang="scss">
    @import "./assets/style/globals.scss";
</style>