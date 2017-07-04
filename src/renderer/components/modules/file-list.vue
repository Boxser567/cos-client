<template>
    <div class="file-list">
        <div class="list header">
            <div class="name">文件名</div>
            <div class="size">大小</div>
            <div class="time">创建时间</div>
        </div>
        <div class="list-info" id="menuinfo" :class="{ 'list-none':listNone }" @click="fileContentClick($event)"
             @contextmenu="openFileMenu($event)">

            <div class="loading" v-if="fileloading">
                <i class="el-icon-loading"></i>
            </div>

            <div class="file-none" v-if="filelist && filelist.length==0 && !newFolder && !fileloading">
                <span>没有文件</span>
            </div>


            <div class="new-file" v-if="newFolder">
                <img src="../../../../static/images/file-icon/folder64x64.png" alt="">
                <el-row>
                    <el-col :span="12">
                        <el-input size="small" v-model="folderName"></el-input>
                    </el-col>
                    <el-col :span="8">
                        <el-button size="small" @click="putBucketFn">确定</el-button>
                        <el-button type="primary" size="small" @click="newFolder=false">取消</el-button>
                    </el-col>
                </el-row>
            </div>

            <div class="list file-list-info" v-if="filelist.length" :class="{ active:f.active }"
                 v-for="f in filelist"
                 @click="itemSelect(f.Name)"
                 @dblclick="goFolder($event,f)"
                 :currentFileName="f.Name"
            >
                <div class="name">
                    <img :src="f.Name | getFileImg" alt="">
                    <p>{{ f.Name }}</p>
                </div>
                <div class="size">{{f.Size | bitSize}}</div>
                <div class="time">{{ f.LastModified | getDate }}</div>
            </div>


        </div>

        <div class="list-progress" :class="{ 'list-none':listNone }">
            <div class="el-side-tab">
                <div class="el-side-head clearfix">
                    <ul>
                        <li :class="{'active' : t.iscur}" @click="tabFn(t)" v-for="t in tabList">{{t.name}}</li>
                    </ul>
                    <div class="el-speed">
                        上传速度: <span>{{upSpeed}}</span>
                        下载速度: <span>{{loadSpeed}}</span>
                        <i class="el-icon-d-arrow-right" @click="listNone = !listNone"></i>
                    </div>
                </div>
                <div class="el-side-content">
                    <div class="first" v-show=" tabList[0].iscur ">
                        <div class="title-bar">
                            <div class="el-button-group">
                                <el-button size="small" :plain="true" @click="uploadFileCtrl('purse')">暂停</el-button>
                                <el-button size="small" :plain="true" @click="uploadFileCtrl('cancel')">取消</el-button>
                            </div>
                            <div class="el-button-group">
                                <el-button size="small" :plain="true" @click="uploadFileCtrl('allBegin')">全部开始
                                </el-button>
                                <el-button size="small" :plain="true" @click="uploadFileCtrl('allPurse')">全部暂停
                                </el-button>
                                <el-button size="small" :plain="true" @click="uploadFileCtrl('allCancel')">全部取消
                                </el-button>
                                <el-button size="small" :plain="true" @click="uploadFileCtrl('clear')">清空已完成</el-button>
                            </div>
                        </div>
                        <div class="progress-file">
                            <div class="progress-bar" :class="{active:file.id === selectUploadFileID}"
                                 v-for="file in fileUploadProgress"
                                 @click="selectLoadFile('upload',file.id)">
                                <img :src="file.Key | getFileImg" alt="">
                                <el-row>
                                    <el-col :span="12">
                                        <p class="tl">{{file.Key}}</p>
                                        <el-progress
                                                :percentage="(file.loaded/file.size * 100) | getInteger"></el-progress>
                                    </el-col>
                                    <el-col :span="4">
                                        {{file.size | bitSize}}
                                    </el-col>
                                    <el-col :span="4">
                                        <span v-if="file.status=='wait'" @click="uploadFileCtrl(file.id)">等待中</span>
                                        <span v-if="file.status=='pause'" @click="uploadFileCtrl(file.id)">暂停</span>
                                        <span v-if="file.status=='complete'" @click="uploadFileCtrl(file.id)">完成</span>
                                        <span v-if="file.status=='run'" @click="uploadFileCtrl(file.id)">{{file.speed}} /s</span>
                                        <span v-if="file.status=='error'" @click="uploadFileCtrl(file.id)">出错</span>
                                    </el-col>
                                    <el-col :span="4">
                                        <i v-if="file.status=='pause'" class="el-icon-caret-right"></i>
                                        <i v-if="file.status == 'run'"> | | </i>
                                        <i class="el-icon-close"></i>
                                    </el-col>
                                </el-row>
                            </div>
                        </div>
                    </div>
                    <div class="second" v-show=" tabList[1].iscur ">
                        <div class="title-bar">
                            <div class="el-button-group">
                                <el-button size="small" :plain="true">暂停</el-button>
                                <el-button size="small" :plain="true">取消</el-button>
                            </div>
                            <div class="el-button-group">
                                <el-button size="small" :plain="true">全部开始</el-button>
                                <el-button size="small" :plain="true">全部暂停</el-button>
                                <el-button size="small" :plain="true">全部取消</el-button>
                                <el-button size="small" :plain="true">清空已完成</el-button>
                            </div>
                        </div>

                        <div class="progress-file">
                            <div class="progress-bar" :class="{active:file.id === selectDownloadFileID}"
                                 v-for="file in fileDownloadProgress"
                                 @click="selectLoadFile('download',file.id)">
                                <img :src="file.Key | getFileImg" alt="">
                                <el-row>
                                    <el-col :span="12">
                                        <p class="tl">{{file.Key}}</p>
                                        <el-progress :percentage="(file.loaded/file.size * 100) | getInteger"></el-progress>
                                    </el-col>
                                    <el-col :span="4">
                                        {{file.size | bitSize}}
                                    </el-col>
                                    <el-col :span="4">
                                        <span v-if="file.status=='wait'" @click="uploadFileCtrl(file.id)">等待中</span>
                                        <span v-if="file.status=='pause'" @click="uploadFileCtrl(file.id)">暂停</span>
                                        <span v-if="file.status=='complete'" @click="uploadFileCtrl(file.id)">完成</span>
                                        <span v-if="file.status=='run'" @click="uploadFileCtrl(file.id)">{{file.speed}} /s</span>
                                        <span v-if="file.status=='error'" @click="uploadFileCtrl(file.id)">出错</span>
                                    </el-col>
                                    <el-col :span="4">
                                        <i v-if="file.status=='pause'" class="el-icon-caret-right"></i>
                                        <i v-if="file.status == 'run'"> | | </i>
                                        <i class="el-icon-close"></i>
                                    </el-col>
                                </el-row>
                            </div>
                        </div>
                    </div>
                    <div class="third" v-show=" tabList[2].iscur ">
                        <div class="title-bar">
                            <div class="el-button-group">
                                <el-button size="small" :plain="true">打开日志列表</el-button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!--文件右键列表信息-->
        <ul id="bucket-menu-list" tabindex="-1" v-show="isShowList" ref="fileRight"
            :style="{top:menu.top,left:menu.left}">
            <li v-for="f in menu.list" @click="rightClickFn(f)"> {{ f.name }}</li>
        </ul>

    </div>
</template>

<script>
  import { mutations, mapState, actions } from 'vuex'
  import { remote, dialog } from 'electron'
  export default {
    name: 'filelist-page',
    props: ['options', 'newfo'],
    data() {
      return {
        newFolder: false,
        listNone: false,
        isShowList: false,
        upSpeed: '-',
        loadSpeed: '-',
        folderName: '新建文件夹',
        selectUploadFileID: null,
        selectDownloadFileID: null,
        menu: {
          list: null,
          top: 0,
          left: 0,
          files: ['download_file', 'copy_file', 'delete_file', 'get_address', 'set_http'],
          folders: ['download_file', 'copy_file', 'delete_file'],
          blanks: ['upload_file', 'new_folder', 'download_list']
        },
        tabList: [
          {iscur: true, name: '上传队列', id: 0},
          {iscur: false, name: '下载队列', id: 1},
          {iscur: false, name: '错误日志', id: 2}
        ]
      }
    },

    computed: {
      fileRightList(){
        return this.$store.state.menulist.fileRightList
      },
      filelist(){
        return this.$store.state.menulist.filelist
      },
      fileloading(){
        return this.$store.state.menulist.fileloading
      },
      selectFile(){
        return this.$store.state.menulist.selectFile
      },
      fileDownloadProgress(){
        console.log('this-fileDownloadProgress', this.$store.state.menulist.fileDownloadProgress)
        return this.$store.state.menulist.fileDownloadProgress
      },
      fileUploadProgress(){
        //console.log('this-fileProgress', this.$store.state.menulist.fileUploadProgress)
        return this.$store.state.menulist.fileUploadProgress
      }
    },
    created(){
      this.fetchData()
    },

    watch: {
      $route: 'fetchData',
      'newfo': function (val, old) {
        if (val != old) {
          this.newFolder = true
        }
      }
    },

    methods: {
      putBucketFn: function () {
        let _self = this
        let bk = this.options.bucket
        let rg = this.options.region
        let folder = this.options.folders ? this.options.folders + this.folderName : this.folderName + '/'
        let parms = {
          Bucket: bk,
          Region: rg,
          Key: folder
        }
        _self.$store.dispatch('bucket/putObject', {pms: parms}).then(function (res) {
          console.log('this-back', res)
          _self.fetchData()
          _self.newFolder = false
          _self.folderName = '新建文件夹'
        })

      },
      fetchData() {
        let bk = this.options.bucket, rg = this.options.region
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
      },
      itemSelect(Name) {
        this.$store.commit('menulist/selectFile', {fileName: Name})
      },
      selectLoadFile(types, id){
        if (types === 'upload')
          this.selectUploadFileID = id
        if (types === 'download')
          this.selectDownloadFileID = id
//        this.$store.commit('menulist/selectLoadFile', id)
      },
      fileContentClick(e){
        if (e.target.classList.contains('list-info')) {
          this.$store.commit('menulist/unSelectFile')
        }
      },
      tabFn(item){
        this.tabList.forEach(function (tab) {
          tab.iscur = false
        })
        item.iscur = true
      },
      goFolder(e, file){
        if (!file.dir) return
        this.options.folders = file.Prefix
        this.options.keyWord = null
        let pms = {bucket: this.options.bucket, region: this.options.region, folders: this.options.folders}
        this.$router.push({
          path: '/file/' + this.options.bucket,
          query: pms
        })
      },
      openFileMenu(e){
        let currentDom = e.target
        if (currentDom.classList.contains('list-info') || currentDom.classList.contains('file-none')) {
          this.$store.commit('menulist/unSelectFile')
          this.menu.list = this.fileRightList.filter((m) => {
            if (this.menu.blanks.includes(m.key)) {
              return m
            }
          })
          this.$store.commit('menulist/unSelectFile')
        } else {
          for (let i = 0; i < 5; i++) {
            if (currentDom.classList.contains('file-list-info')) {
              let currentFileName = currentDom.getAttribute('currentFileName')
              if (currentFileName) {
                this.$store.commit('menulist/selectFile', {fileName: currentFileName})
              }
              break
            }
            currentDom = currentDom.parentNode
          }
          if (this.selectFile) {
            if (this.selectFile.dir) {
              this.menu.list = this.fileRightList.filter((m) => {
                if (this.menu.folders.includes(m.key)) {
                  return m
                }
              })
            } else {
              this.menu.list = this.fileRightList.filter((m) => {
                if (this.menu.files.includes(m.key)) {
                  return m
                }
              })
            }
          }
        }

        let _self = this
        this.$nextTick(function () {
          let top = e.y - 90, left = e.x - 225
          let largestHeight = window.innerHeight - _self.$refs.fileRight.offsetHeight - 25
          let largestWidth = window.innerWidth - _self.$refs.fileRight.offsetWidth - 225
          if (top > largestHeight) top = largestHeight
          if (left > largestWidth) left = largestWidth
          _self.menu.top = top + 'px'
          _self.menu.left = left + 'px'
          _self.isShowList = true
          document.addEventListener('click', _self.closeFileMenu)
        })
        e.preventDefault()
      },
      closeFileMenu() {
        this.isShowList = false
        document.removeEventListener('click', this.closeFileMenu)
      },
      uploadFileCtrl(types){
        this.$store.dispatch('menulist/uploadFileCtrl', types)
      },
      rightClickFn(item){
        switch (item.key) {
          case 'upload_file' :      //上传文件
            remote.dialog.showOpenDialog({
              filters: [{name: 'All Files', extensions: ['*']}],
              properties: ['openFile', 'multiSelections']
            }, function () {
              console.log(arguments)
            })
            break
          case 'new_folder':    //新建文件夹
            break
          case 'download_file':
            remote.dialog.showSaveDialog({
              filters: [{name: 'All Files', extensions: ['*']}],
              properties: ['openFile', 'multiSelections']
            }, function () {
              console.log(arguments)
            })
            break
          case 'copy_file':
            break
          case 'delete_file':
            break
          case 'get_address':
            break
          case 'set_http':
            break
          case 'paste_file':
            break
          case 'download_list':
            break
          default:
            this.$message('请重启客户端后重试！')
            break
        }
      },
    }
  }
</script>


