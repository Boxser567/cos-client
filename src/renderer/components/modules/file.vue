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
                            <li v-for="(n, index) in navOptions" @click="goFilePath(index)">{{ n.name }}</li>
                        </ul>
                        <div class="search-inbar" v-show="inputFocus">
                            在<span>{{currentFolder}}</span>中搜索
                        </div>
                    </div>
                    <input type="text" v-model="keyWord" @focus="focusSearch" @blur="blurSearch"
                           @keyup.enter="searchFn">
                    <i class="el-icon-close" v-show="keyWord" @click="searchCancelFn"></i>
                    <i class="el-icon-search" v-show="!keyWord" @click="searchFn"></i>
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
                        <el-button size="small" :plain="true" @click="controlObj('set_limit')" :disabled="eableBtn1()">
                            设置权限
                        </el-button>
                    </div>
                    <div class="el-button-group">
                        <el-button size="small" :plain="true" @click="controlObj('get_address')"
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

        <file-list @sendObj="controlObj"></file-list>

        <file-limit :isShow.sync="dialogFileLimit" :options="limitOption"></file-limit>

        <file-adress :isShow="dialogFileAdress"
                     @closeDialog="dialogFileAdress = false"></file-adress>

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
      let options = {
        bucket: to.query.bucket,
        region: to.query.region
      }
      this.navOptions = [].concat({name: options.bucket})
      if (to.path !== from.path) {
        this.keyWord = ''
        options.folders = ''
      } else {
        options.folders = to.query.folders
        let navbar = to.query.folders
        if (navbar && navbar.length) {
          navbar = navbar.split('/')
          navbar.forEach(n => { if (n) this.navOptions.push({name: n}) })
        }
      }
      this.$store.commit('menulist/options', options)
      this.fetchFilelist()
      next()
    },
    computed: {
      ...mapState('menulist', ['fileloading', 'selectFile', 'dialogGetHttp', 'fileHeaderInfo', 'options'])
    },
    data () {
      return {
        keyWord: '',
        navOptions: [],
        inputFocus: false,
        currentFolder: null,
        dialogSetHttpHead: false,
        dialogFileAdress: false,
        dialogFileLimit: false,
        limitOption: null
      }
    },
    methods: {
      eableBtn () {
        return !this.selectFile || !this.selectFile.length
      },

      eableBtn1 (type) { // 获取地址
        if (!this.selectFile || !this.selectFile.length) return true
        if (type === 'adress' && this.selectFile.length > 1) return true
        for (let item of this.selectFile) {
          if (item.dir) return true
        }
        return false
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
        this.keyWord = ''
        this.$router.push({
          path: '/file/' + this.options.bucket,
          query: {
            bucket: this.options.bucket,
            region: this.options.region,
            folders: goFolder
          }
        })
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
        if (!this.keyWord) return
        let params = {
          Bucket: this.options.bucket,
          Region: this.options.region,
          Page: 'file',
          Keywords: this.keyWord,
          Prefix: this.options.folders
        }
        this.$store.dispatch('menulist/getFileList', params)
      },

      searchCancelFn () {
        this.keyWord = ''
      },

      controlObj (val) {
        switch (val) {
          case 'delete_file':
            this.deleteObj()
            break
          case 'set_limit':
            this.limitOption = {
              Bucket: this.options.bucket,
              Region: this.options.region,
              type: 'files'
            }
            this.dialogFileLimit = true
            break
          case 'get_address':
            this.dialogFileAdress = true
            break
          case 'set_http':
            this.dialogSetHttpHead = true
            break
          default :
            break
        }
      },

      async deleteObj () {
        try {
          await this.$confirm('确定要删除?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          })

          let params = {
            Bucket: this.options.bucket,
            Region: this.options.region,
            Dirs: [],
            Keys: []
          }
          this.selectFile.forEach(n => {
            n.dir ? params.Dirs.push(n.Prefix) : params.Keys.push(n.Key)
          })
          await this.$store.dispatch('deleteObjects', params)

          // 删除完成后刷新文件列表
          await this.$store.dispatch('menulist/getFileList', {
            Bucket: this.options.bucket,
            Region: this.options.region,
            Prefix: this.options.folders
          })
        } catch (e) {
          if (e !== 'cancel') console.error(e)
        }
      },

      copyObj () {
        this.$store.commit('menulist/copyFiles')
      },

      fileEvents (types) {
        switch (types) {
          case 'upload':
            this.$store.dispatch('menulist/uploadFile')
            return
          case 'download':
            this.$store.dispatch('menulist/downloadFile')
            return
          case 'newFolder':
            this.$store.commit('menulist/newFolder', true)
        }
      },

      fetchFilelist () {
        let params = {
          Bucket: this.options.bucket,
          Region: this.options.region,
          Prefix: this.options.folders
        }
        this.$store.dispatch('menulist/getFileList', params)
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
