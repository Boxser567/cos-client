<template>
    <div class="slide-right">
        <div class="head">
            <div class="top-row">
                <div class="history">
                    <i class="el-icon-arrow-left" @click="goForward"></i>
                    <i class="el-icon-arrow-right" @click="backForward"></i>
                </div>
                <div class="nav-bar">
                    <div class="nav">
                        <ul v-show="!inputFocus">
                            <li v-for="(n,index) in navOptions" @click="goFilePath(index)">{{ n.name }}</li>
                        </ul>
                        <div class="search-inbar" v-show="inputFocus">
                            在<span>{{currentFolder}}</span>中搜索
                        </div>
                    </div>
                    <input type="text" v-model="options.keyWord" @focus="focusSearch" @blur="blurSearch"
                           @keyup.enter="searchFn">
                    <i class="el-icon-close" v-show="options.keyWord" @click="searchCancelFn"></i>
                    <i class="el-icon-search" v-show="!options.keyWord" @click="searchFn"></i>
                </div>
            </div>
            <div class="bottom-row">
                <div class="file-opts">
                    <div class="el-button-group">
                        <el-button size="small" class="upload" @click="fileEvents('upload')"><span
                                class="el-icon-plus"></span> 上传文件
                        </el-button>
                    </div>
                    <div class="el-button-group">
                        <el-button size="small" @click="fileEvents('newFolder')">创建文件夹</el-button>
                    </div>
                    <div class="el-button-group">
                        <el-button size="small" :plain="true" @click="fileEvents('download')" :disabled="eableBtn()">下载
                        </el-button>
                        <el-button size="small" :plain="true" @click="copyObj" :disabled="eableBtn()">复制
                        </el-button>
                        <el-button size="small" :plain="true" @click="deleteObj" :disabled="eableBtn()">删除
                        </el-button>
                        <el-button size="small" :plain="true" @click="dialogFileLimit =true" :disabled="eableBtn()">设置权限
                        </el-button>
                    </div>
                    <div class="el-button-group">
                        <el-button size="small" :plain="true" @click="dialogFileAdress = true"
                                   :disabled="eableBtn1('adress')">
                            获取地址
                        </el-button>
                    </div>
                    <div class="el-button-group">
                        <el-button size="small" :plain="true" @click="dialogSetHttpHead = true"
                                   :disabled="eableBtn1()">设置HTTP头
                        </el-button>
                    </div>
                    <span class="area">{{ options.region | getArea}}</span>
                </div>
            </div>
        </div>

        <file-list :options="options" @deleteObj="deleteObj"></file-list>

        <file-limit :isShow="dialogFileLimit" @closeDialog="dialogFileLimit = false"></file-limit>

        <file-adress :isShow="dialogFileAdress" @closeDialog="dialogFileAdress = false"></file-adress>

        <set-http-head :isShow="dialogSetHttpHead" @closeDialog="dialogSetHttpHead = false"></set-http-head>

    </div>
</template>

<script>
  import fileList from './file-list.vue'
  import fileAdress from './file-adress'
  import fileLimit from './file-limit.vue'
  import setHttpHead from './set-http-head.vue'
  import { mapState } from 'vuex'
  export default {
    name: 'filepage',
    components: {fileList, fileAdress, fileLimit, setHttpHead},
    beforeRouteUpdate (to, from, next) {
      this.options.bucket = to.params.bucket || to.query.bucket
      this.options.region = to.params.region || to.query.region
      this.navOptions = [].concat({name: this.options.bucket})
      if (to.path !== from.path) {
        this.options.keyWord = null
        this.options.folders = []
      } else {
        this.options.folders = to.query.folders
        let navbar = to.query.folders
        if (navbar && navbar.length) {
          navbar = navbar.split('/')
          navbar.forEach(n => { if (n) this.navOptions.push({name: n}) })
        }
      }
      // console.log('router钩子', to.params, this.options)
      next()
    },
    computed: {
      ...mapState('menulist', ['fileloading', 'selectFile', 'dialogGetHttp', 'fileHeaderInfo'])
    },
    data () {
      return {
        options: {
          bucket: null, // this.$route.params.bucket
          region: null,
          folders: null,
          keyWord: null
        },
        navOptions: [],
        inputFocus: false,
        currentFolder: null,
        dialogSetHttpHead: false,
        dialogFileAdress: false,
        dialogFileLimit: false
      }
    },
    methods: {
      eableBtn () {
        if (this.selectFile && this.selectFile.length) {
          return false
        } else {
          return true
        }
      },
      eableBtn1 (type) { // 获取地址
        if (this.selectFile && this.selectFile.length) {
          let array = this.selectFile.map(n => !!n.dir)
          if (array.includes(false) && array.includes(true)) {
            return true
          } else if (array.includes(true)) {
            return true
          } else {
            if (type === 'adress') {
              if (this.selectFile.length > 1) {
                return true
              }
            } else {
              return false
            }
          }
        } else {
          return true
        }
      },
      goFilePath (index) {
        if (!this.navOptions.length) return
        if (index === this.navOptions.length - 1) return
        let goFolder = ''
        let currentArr = [].concat(this.navOptions)
        currentArr.splice(0, 1)
        if (index !== 0) {
          currentArr.forEach((nav, idx) => {
            if (idx < index) { goFolder += nav.name + '/' }
          })
        }
        let topage = {
          path: '/file/' + this.options.bucket,
          query: {
            bucket: this.options.bucket,
            region: this.options.region,
            folders: goFolder
          }
        }
        this.options.keyWord = null
        this.$router.push(topage)
      },
      blurSearch () {
        this.inputFocus = false
      },
      focusSearch () {
        console.log(this.navOptions)
        if (this.navOptions && this.navOptions.length) {
          let obj = this.navOptions[this.navOptions.length - 1]
          this.currentFolder = obj.name
          this.inputFocus = true
        }
      },
      searchFn () {
        if (!this.options.keyWord) return
        this.$store.commit('menulist/fileloading', {loading: true})
        let params = {
          Bucket: this.options.bucket,
          Region: this.options.region,
          Page: 'file',
          Keywords: this.options.keyWord
        }
        if (this.options.folders && this.options.folders.length) {
          params.Prefix = this.options.folders
        }
        this.$store.dispatch('menulist/getFileList', {pms: params}).then(() => this.$store.commit('menulist/fileloading', {loading: false}))
      },
      searchCancelFn () {
        this.options.keyWord = null
      },
      deleteObj () {
        this.$confirm('确定要删除?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          let parmas = {
            Bucket: this.options.bucket,
            Region: this.options.region,
            Key: this.selectFile.dir ? this.selectFile.Prefix : this.selectFile.Key
          }
          this.$store.dispatch('menulist/deleteFile', parmas).then((resp) => {
            // 删除完成后刷新文件列表
            let bk = this.options.bucket
            let rg = this.options.region
            this.$store.commit('menulist/fileloading', {loading: true})
            if (bk && rg) {
              let params = {Bucket: bk, Region: rg}
              if (this.options.folders && this.options.folders.length) {
                params.Prefix = this.options.folders
              }
              this.$store.dispatch('menulist/getFileList', {pms: params}).then(() => {
                this.$store.commit('menulist/fileloading', {loading: false})
                this.$store.commit('menulist/unSelectFile')
              })
            }
          })
        }).catch(() => {
        })
      },
      copyObj () {
        let pms = {
          Bucket: this.options.bucket,
          Region: this.options.region,
          Prefix: (this.options.folders && this.options.folders.length > 0) ? this.options.folders : ''
        }
        this.$store.commit('menulist/copyFiles', pms)
      },
      fileEvents (types) {
        let pms = {
          Bucket: this.options.bucket,
          Region: this.options.region,
          Prefix: (this.options.folders && this.options.folders.length > 0) ? this.options.folders : ''
        }
        if (types === 'upload') {
          this.$store.commit('menulist/uploadFile', pms)
        }
        if (types === 'download') { this.$store.commit('menulist/downloadFile', pms) }
        if (types === 'newFolder') { this.$store.commit('menulist/newFolder', true) }
      },
      fetchFilelist () { // 刷新文件列表，重走路由
        let qey = {
          bucket: this.options.bucket,
          region: this.options.region,
          folders: this.options.folders
        }
        console.log('this-routers', qey)
        this.$router.push({
          path: '/file/' + this.options.bucket,
          query: qey
        })
      },
      goForward () {
        this.$router.go(-1)
      },
      backForward () {
        this.$router.go(1)
      }
    }
  }
</script>


