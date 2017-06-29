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
                        <ul>
                            <li v-for="(n,index) in navOptions" @click="goFilePath(index)">{{ n.name }}</li>
                        </ul>
                    </div>
                    <input type="text" v-model="options.keyWord" @keyup.enter="searchFn">
                    <i class="el-icon-search" @click="searchFn"></i>
                </div>
            </div>
            <div class="bottom-row">
                <div class="file-opts">
                    <div class="el-button-group">
                        <el-upload
                                class="small-upload"
                                action="http://11231231-1253834952.cn-north.myqcloud.com"
                                :show-file-list="false"
                                :multiple="true"
                                :http-request="onProgress"
                        >
                            <el-button size="small" type="primary">点击上传</el-button>
                        </el-upload>

                        <el-button size="small" @click="newFolder = !newFolder">新建文件夹</el-button>
                    </div>

                    <div class="el-button-group">
                        <el-button size="small" :plain="true"
                                   :disabled="selectFile ? selectFile.select ? false : true : false">下载
                        </el-button>
                        <el-button size="small" :plain="true"
                                   :disabled="selectFile ? selectFile.select ? false : true : false">复制
                        </el-button>
                        <el-button size="small" :plain="true" @click="menuObj().deleteObj()"
                                   :disabled="selectFile ? selectFile.select ? false : true : false">删除
                        </el-button>
                    </div>

                    <div class="el-button-group">
                        <el-button size="small" :plain="true"
                                   :disabled="selectFile ? selectFile.select ? false : true : false">获取地址
                        </el-button>
                    </div>

                    <div class="el-button-group">
                        <el-button size="small" :plain="true"
                                   :disabled="selectFile ? selectFile.select ? false : true : false">设置HTTP头
                        </el-button>
                    </div>

                    <span class="area">{{ options.region | getArea}}</span>
                </div>
            </div>
        </div>

        <file-list :options="options" :newfo="newFolder"></file-list>

    </div>
</template>

<script>
  import filelist from './file-list.vue'
  import { mutations, mapState, actions } from 'vuex'
  export default {
    name: 'filepage',
    components: {'file-list': filelist},
    beforeRouteUpdate (to, from, next) {
      this.options.bucket = to.params.bucket || to.query.bucket
      this.options.region = to.params.region || to.query.region
      this.navOptions = [{name: this.options.bucket}]
      if (to.path != from.path) {
        this.options.keyWord = null
        this.options.folders = []
      } else {
        this.options.folders = to.query.folders
        let navbar = to.query.folders
        if (navbar) {
          navbar = navbar.split('/')
          navbar.splice(navbar.length - 1, 1)
          navbar.forEach((n) => this.navOptions.push({name: n}))
        }
      }
      //console.log('router钩子', to.params, this.options)
      next()
    },
    computed: {
      fileloading(){
        return this.$store.state.menulist.fileloading
      },
      selectFile(){
        return this.$store.state.menulist.selectFile
      }
    },
    data() {
      return {
        options: {
          bucket: null,//this.$route.params.bucket
          region: null,
          folders: null,
          keyWord: null
        },
        navOptions: [],
        newFolder: false
      }
    },
    methods: {
      goFilePath(index){
        if (this.navOptions.length) {
          if (index == this.navOptions.length - 1) return
          let goFolder = ''
          if (index != 0) {
            this.navOptions.forEach((nav, idx) => {
              if (idx <= index && nav.name != this.options.bucket)
                goFolder += nav.name + '/'
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
        }
      },

      searchFn(){
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
      onProgress(filelist) {
        console.log(filelist)
        let path = filelist.file.path
        let fileName = filelist.file.name  //path.replace(/\\/g, '/').replace(/.*\//, '');
        let pms = {
          params: {
            Bucket: this.options.bucket,
            Region: this.options.region,
            Key: fileName
          },
          file: {
            fileName: path,
            fileSize: filelist.file.size
          },
          option: {
            onProgress: function () {
              console.log('this-progress', arguments)
            },
            cancel: function () {
              console.log('this-cancel', arguments)
            }
          }
        }
        this.$store.dispatch('menulist/sliceUploadFile', pms)
      },
      menuObj() {
        let _self = this
        let parmsObj = {
          Bucket: this.options.bucket,
          Region: this.options.region,
        }
        return {
          deleteObj(){
            _self.$confirm('确定要删除?', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }).then(() => {
              let parmas = Object.assign(parmsObj, {Key: _self.selectFile.dir ? _self.selectFile.Prefix : _self.selectFile.Key})
              _self.$store.dispatch('menulist/deleteFile', {pms: parmas}).then(function (resp) {
                if (resp.DeleteObjectSuccess) {
                  _self.fetchFilelist()
                } else {
                  _self.$message({type: 'error', message: resp.error})
                }
              })
            }).catch(() => {
            })
          }
        }
      },
      fetchFilelist(){        //刷新文件列表，重走路由
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
      goForward(){
        console.log(this.$router)
      },
      backForward(){
//                this.$router.go(-1);
      }
    }
  }
</script>


