<template>
    <div>
        <router-view></router-view>

        <delete-error :isShow.sync="deleteError" :errorMsg="errorMsg"></delete-error>
        <delete-content :isShow.sync="deleteContent" :errorContent="errorContent"></delete-content>
    </div>
</template>

<script>
  import { ipcRenderer } from 'electron'
  import log from 'electron-log'
  import deleteError from './modules/dialog/deleteError.vue'
  import deleteContent from './modules/dialog/deleteContent.vue'
  import indexPage from './index.vue'

  export default {
    name: 'main-page',
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
      this.$store.getters.bus.$on('globleError', (err) => {
        log.error(err)
        let errorMsg = err.message
        if (err.statusCode) {
          errorMsg = err.error.Message
        }
        this.$notify.error({
          title: 'Error',
          message: errorMsg
        })
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
    components: {deleteError, deleteContent, indexPage},
    methods: {}
  }
</script>