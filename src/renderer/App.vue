<template>
    <div id="app">
        <router-view></router-view>
        <delete-error :isShow.sync="deleteError" :errorMsg="errorMsg"></delete-error>
        <delete-content :isShow.sync="deleteContent" :errorContent="errorContent"></delete-content>
    </div>
</template>

<script>
  import { ipcRenderer } from 'electron'
  import deleteError from './components/modules/dialog/deleteError.vue'
  import deleteContent from './components/modules/dialog/deleteContent.vue'
  export default {
    name: 'gk-cos-client',
    created () {
      this.$store.dispatch('getConfig')
      ipcRenderer.on('error', (event, error) => {
        this.$notify.error({
          title: 'Error',
          message: `无法${error.src}，因为${error.message}`
        })
      })
      window.onbeforeunload = (e) => {
        if (process.env.NODE_ENV !== 'development') {
          if (confirm('确定要关闭吗？')) return
          e.returnValue = false
        }
      }
      this.$router.replace('/login')
    },
    mounted () {
      this.$store.getters.bus.$on('batch', (resp) => {
        if (resp) {
          switch (resp.action) {
            case 'open':
              this.deleteError = true
              this.errorMsg = resp
              break
            case 'data':
              this.errorMsg = resp
              break
            case 'finish':
              this.errorMsg = resp
              break
          }
        }
      })
      this.$store.getters.bus.$on('confirm', (resp) => {
        console.log('this-confirm', resp)
        if (resp) {
          this.errorContent = resp
          this.deleteContent = true
        }
      })
    },
    data () {
      return {
        deleteError: false,
        errorMsg: null,
        deleteContent: false,
        errorContent: ''
      }
    },
    components: {deleteError, deleteContent},
    methods: {}
  }
</script>

<style>
    @import '../../node_modules/element-ui/lib/theme-default/index.css';
</style>
<style lang="scss">
    @import "./assets/style/globals.scss";
</style>