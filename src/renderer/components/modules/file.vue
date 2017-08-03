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
                    <span class="area">{{ options.Region | getArea }}</span>
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
      let options = to.query
      this.navOptions = [].concat({name: options.Bucket})
      if (to.path !== from.path) {
        this.keyWord = ''
        options.Prefix = ''
      } else {
        if (to.query.Prefix) {
          to.query.Prefix.split('/').forEach(name => this.navOptions.push({name}))
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
        let Prefix = ''
        let currentArr = [].concat(this.navOptions)
        currentArr.splice(0, 1)
        if (index !== 0) {
          currentArr.forEach((nav, idx) => {
            if (idx < index) { Prefix += nav.name + '/' }
          })
        }
        this.keyWord = ''
        this.$router.push({
          path: '/file/' + this.options.Bucket,
          query: {
            Bucket: this.options.Bucket,
            Region: this.options.Region,
            Prefix
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
        this.$store.dispatch('menulist/getFileList', Object.assign({
          Page: 'file',
          Keywords: this.keyWord
        }, this.options))
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
              Bucket: this.options.Bucket,
              Region: this.options.Region,
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
            Bucket: this.options.Bucket,
            Region: this.options.Region,
            Dirs: [],
            Keys: []
          }
          this.selectFile.forEach(n => {
            n.dir ? params.Dirs.push(n.Prefix) : params.Keys.push(n.Key)
          })
          await this.$store.dispatch('deleteObjects', params)

          // 删除完成后刷新文件列表
          await this.$store.dispatch('menulist/getFileList', this.options)
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
        this.$store.dispatch('menulist/getFileList', this.options)
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
