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
                        <el-button size="small" :plain="true" @click="menuObj().getFileUrl()"
                                   :disabled="selectFile ? selectFile.select ? false : true : false">获取地址
                        </el-button>
                    </div>

                    <div class="el-button-group">
                        <el-button size="small" :plain="true" @click="menuObj().dialogSetHttpFn()"
                                   :disabled="selectFile ? selectFile.select ? false : true : false">设置HTTP头
                        </el-button>
                    </div>

                    <span class="area">{{ options.region | getArea}}</span>
                </div>
            </div>
        </div>

        <file-list :options="options" :newfo="newFolder"></file-list>

        <el-dialog title="获取Object地址"
                   custom-class="dialog-http"
                   :visible.sync="dialogGetHttp.isShow"
                   :close-on-click-modal="false"
                   :close-on-press-escape="false"
                   :show-close="false"
                   size="small">
            <el-row>
                <el-col :span="8">文件名:</el-col>
                <el-col :span="16">{{dialogGetHttp.bucket}}</el-col>
            </el-row>
            <el-row>
                <el-col :span="8">地址:</el-col>
                <el-col :span="16">
                    <p id="myEle">{{dialogGetHttp.url}}</p>
                    <el-button type="primary" size="small" @click="menuObj().selectText()">复制</el-button>
                </el-col>
            </el-row>
            <div slot="footer" class="dialog-footer">
                <el-button type="primary" @click="menuObj().dialogHttpHideFn()">确 定</el-button>
            </div>
        </el-dialog>


        <!--设置Http头-->
        <el-dialog
                title="设置header"
                custom-class="dialog-header"
                :visible.sync="fileHeaderInfo.isShow"
                :close-on-click-modal="false"
                :close-on-press-escape="false"
                :show-close="false"
                size="small">
            <table class="my-el-table" cellpadding="0" cellspacing="0">
                <thead>
                <tr>
                    <td>参数</td>
                    <td>值</td>
                    <td>操作</td>
                </tr>
                </thead>
                <tbody>
                <tr v-for="(list,$index) in fileHeaderInfo.data">
                    <td>
                        <el-select v-model="list.date" @change="menuObj().selectHttpChange(list,$index)"
                                   placeholder="选择项目" size="small">
                            <el-option
                                    v-for="item in list.date"
                                    :key="item.value"
                                    :label="item.label"
                                    :value="item.value">
                            </el-option>
                        </el-select>
                    </td>
                    <td>
                        <el-input size="small"></el-input>
                    </td>
                    <td>
                        <a class="text" @click="menuObj().deleteHttpDom($index)">删除</a>
                    </td>
                </tr>
                </tbody>
            </table>


            <el-button type="text" @click="menuObj().addElemHeader()"><i class="el-icon-plus"></i>添加参数</el-button>
            <div slot="footer" class="dialog-footer">
                <el-button @click="menuObj().dialogSetHttpFn('cancel')">取 消</el-button>
                <el-button type="primary" @click="menuObj().dialogSetHttpFn()">确 定</el-button>
            </div>
        </el-dialog>

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
        if (navbar && navbar.length) {
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
      },
      dialogGetHttp: {
        get(){
          return this.$store.state.menulist.dialogGetHttp
        },
        data: {
          select: {
            set(value){
              console.log('1231111111', value)
            }
          }
        }
      },
      fileHeaderInfo(){
        return this.$store.state.menulist.fileHeaderInfo
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
        currentFolder: null,
        newFolder: false,
        inputFocus: false
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
      blurSearch(){
        this.inputFocus = false
      },
      focusSearch(){
        if (this.navOptions && this.navOptions.length) {
          this.currentFolder = ([].concat(this.navOptions.pop())).name
          this.inputFocus = true
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
      searchCancelFn(){
        this.options.keyWord = null
      },
      onProgress(filelist) {
        console.log(filelist)
        let path = filelist.file.path
        let fileName = filelist.file.name  //path.replace(/\\/g, '/').replace(/.*\//, '');
        let pms = {
          params: {
            Bucket: this.options.bucket,
            Region: this.options.region,
            Key: fileName,
            fileName: path
          },
          file: {

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
          getFileUrl(){  //获取文件url地址
            _self.$store.commit('menulist/getFileHttp', parmsObj)
          },
          dialogHttpHideFn(){
            _self.$store.commit('menulist/setFileHttpHidden')
          },
          selectText(e){
            _self.$message('功能没做...')
          },
          dialogSetHttpFn(type){
            _self.$store.commit('menulist/setHttp', type)
          },
          selectHttpChange(list, index){
            console.log(list, index)
//            _self.$store.commit('menulist/selectHttpChange', {list: list, index: index})
          },
          addElemHeader(){
            _self.$store.commit('menulist/addHttpDom')
          },
          deleteHttpDom(index){
            _self.$store.commit('menulist/deleteHttpDom', index)
          },
          deleteObj(){
            _self.$confirm('确定要删除?', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }).then(() => {
              let parmas = Object.assign(parmsObj, {Key: _self.selectFile.dir ? _self.selectFile.Prefix : _self.selectFile.Key})
              _self.$store.dispatch('menulist/deleteFile', {pms: parmas}).then(function (resp) {
                console.log('this-delete', arguments)
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
//        this.$router.go(-1);
      },
      btnDisable(){
        if (this.selectFile) {
          if (this.selectFile.dir) {
            return false
          } else if (selectFile.select) {
            return true
          }
          else {
            return false
          }
        } else {
          return false
        }
      }
    }
  }
</script>


