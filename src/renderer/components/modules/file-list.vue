<template>
    <div class="file-list">
        <div class="list header">
            <div class="name">文件名</div>
            <div class="size">大小</div>
            <div class="time">创建时间</div>
        </div>
        <div class="list-info" id="menuinfo" @click="fileContentClick($event)" :class="{ active:isShowFileProgress }"
             @contextmenu="openFileMenu($event)">

            <div class="loading" v-if="fileloading">
                <i class="el-icon-loading"></i>
            </div>

            <div class="file-none" v-if="filelist && filelist.length==0 && !newFolder && !fileloading">
                <span>没有文件</span>
            </div>

            <div class="new-file" v-show="newFolder">
                <img src="../../../../static/images/file-icon/folder64x64.png" alt="">
                <el-row>
                    <el-col :span="12">
                        <el-input size="small" v-model="folderName"></el-input>
                    </el-col>
                    <el-col :span="8">
                        <el-button size="small" @click="addFolderFn">确定</el-button>
                        <el-button type="primary" size="small" @click="rightClickFn('new_folder_cancel')">取消</el-button>
                    </el-col>
                </el-row>
            </div>

            <div class="list file-list-info" v-if="filelist.length" :class="{ active:f.active }"
                 v-for="(f,$index) in filelist"
                 @click="itemSelect($event,$index, f)"
                 @dblclick="goFolder($event,f)"
                 :index="$index"
                 :key="f.Name"
            >
                <div class="name">
                    <img :src="f.Name | getFileImg" alt="">
                    <p>{{ f.Name }}</p>
                </div>
                <div class="size">{{f.Size | bitSize}}</div>
                <div class="time">{{ f.LastModified | getDate }}</div>
            </div>
        </div>

        <file-progress :options="options"></file-progress>

        <!--文件右键列表信息-->
        <ul id="bucket-menu-list" tabindex="-1" v-show="isShowList" ref="fileRight"
            :style="{top:menu.top,left:menu.left}">
            <li v-for="f in menu.list" @click="rightClickFn(f.key)"> {{ f.name }}</li>
        </ul>

    </div>
</template>

<script>
  import { mutations, mapState, actions } from 'vuex'

  import { remote, dialog } from 'electron'

  import fileProgress from './file-progress.vue'

  export default {
    name: 'filelist-page',
    props: ['options'],

    data() {
      return {
        isShowList: false,   //右键菜单的显示
        folderName: '新建文件夹',
        menu: {
          list: null,
          top: 0,
          left: 0,
          files: ['download_file', 'copy_file', 'delete_file', 'get_address', 'set_http'],
          folders: ['download_file', 'copy_file', 'delete_file'],
          blanks: ['upload_file', 'new_folder', 'download_list'],
          groupFile: ['download_file', 'copy_file', 'delete_file', 'set_http']
        }
      }
    },

    components: {'file-progress': fileProgress},

    computed: {
      ...mapState('menulist', ['fileRightList', 'filelist', 'fileloading', 'selectFile', 'newFolder', 'copyFiles', 'isShowFileProgress'])
    },
    created(){
      this.fetchData()
    },

    watch: {
      $route: 'fetchData',
      copyFiles: function (val) {
        let exst = this.menu.files.indexOf('paste_file') > -1
        if (val && val.length) {
          if (!exst) {
            this.menu.files.push('paste_file')
            this.menu.folders.push('paste_file')
            this.menu.blanks.push('paste_file')
            this.menu.groupFile.push('paste_file')
          }
        } else {
          if (exst) {
            this.menu.files.splice(this.menu.files.length - 1, 1)
            this.menu.folders.splice(this.menu.folders.length - 1, 1)
            this.menu.blanks.splice(this.menu.blanks.length - 1, 1)
            this.menu.groupFile.splice(this.menu.groupFile.length - 1, 1)
          }
        }
      }
    },

    methods: {
      addFolderFn: function () {   //新建文件夹
        let bk = this.options.bucket
        let rg = this.options.region
        let folder = this.options.folders ? this.options.folders + this.folderName : this.folderName + '/'
        let parms = {
          Bucket: bk,
          Region: rg,
          Key: folder
        }
        this.$store.dispatch('bucket/putObject', parms).then((res) => {
          console.log('new-folder', res)
//          this.fetchData()
          this.$store.commit('menulist/newFolder', false)
          this.folderName = '新建文件夹'
        })
      },

      fetchData() {   //渲染页面
        let bk = this.options.bucket, rg = this.options.region
        this.$store.commit('menulist/fileloading', {loading: true})
        if (bk && rg) {
          let params = {Bucket: bk, Region: rg}
          if (this.options.folders && this.options.folders.length) {
            params.Prefix = this.options.folders
          }
          this.$store.dispatch('menulist/getFileList', {pms: params}).then(() => {
            this.$store.commit('menulist/fileloading', {loading: false})
//            this.$store.commit('menulist/unSelectFile')
          })
        }
      },

      //文件选择
      itemSelect(e, index, file) {
        let array = {
          file: file,
          key: false,
          index: index
        }
        if (e.shiftKey) {
          array.key = true
        }
        this.$store.commit('menulist/selectFile', array)
      },

      //文件空白处单击
      fileContentClick(e) {
        if (e.target.classList.contains('list-info')) {
          this.$store.commit('menulist/unSelectFile')
        }
      },
      //双击文件夹
      goFolder(e, file){
        if (!file.dir) return
        this.options.folders = file.Prefix
        this.options.keyWord = null
        let pms = {bucket: this.options.bucket, region: this.options.region, folders: this.options.folders}
//        this.$store.commit('menulist/unSelectFile')
        this.$router.push({
          path: '/file/' + this.options.bucket,
          query: pms
        })
      },

      //创建并显示右键菜单
      openFileMenu(e){
        let currentDom = e.target
        this.$store.commit('menulist/unSelectFile')
        if (currentDom.classList.contains('list-info') || currentDom.classList.contains('file-none')) {
          this.menu.list = this.fileRightList.filter((m) => {
            if (this.menu.blanks.includes(m.key)) {
              return m
            }
          })
        } else {
          if (this.selectFile && this.selectFile.length > 1) {
            let array = this.selectFile.map(n => n.dir ? true : false)

            if (array.includes(false) && (!array.includes(true))) {
              this.menu.list = this.fileRightList.filter((m) => {
                if (this.menu.groupFile.includes(m.key)) {
                  return m
                }
              })
            }
            else {
              this.menu.list = this.fileRightList.filter((m) => {
                if (this.menu.folders.includes(m.key)) {
                  return m
                }
              })
            }

          } else {
            let cfile = null, index = null
            for (let i = 0; i < 5; i++) {
              if (currentDom.classList.contains('file-list-info')) {
                index = currentDom.getAttribute('index')
                if (index !== undefined) {
                  cfile = this.filelist[index]
                  this.$store.commit('menulist/selectFile', {file: cfile, index: index})
                }
                break
              }
              currentDom = currentDom.parentNode
            }
            if (cfile && index) {
              if (cfile.dir) {
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

      //关闭右键菜单
      closeFileMenu() {
        this.isShowList = false
        document.removeEventListener('click', this.closeFileMenu)
      },

      //右键菜单点击事件
      rightClickFn(item){
        if (!item) return
        let pms = {
          Bucket: this.options.bucket,
          Region: this.options.region,
          Prefix: (this.options.folders && this.options.folders.length > 0) ? this.options.folders : ''
        }

        switch (item) {
          case 'upload_file' :      //上传文件
            this.$store.commit('menulist/uploadFile', pms)
            break
          case 'new_folder':    //新建文件夹
            this.$store.commit('menulist/newFolder', true)
            break
          case 'new_folder_cancel':
            this.$store.commit('menulist/newFolder', false)
            break
          case 'download_file':
            this.$store.commit('menulist/downloadFile', pms)
            break
          case 'copy_file':
            this.$store.commit('menulist/copyFiles')
            break
          case 'delete_file':
            this.$store.dispatch('menulist/deleteFile', pms).then(() => {
              console.log('mineArgument', arguments)
              this.$store.dispatch('menulist/getFileList', pms)
            })
            break
          case 'get_address':
            break
          case 'set_http':
            break
          case 'paste_file':
            this.$store.commit('menulist/pasteFiles')
            break
          case 'download_list':
            console.log(this.copyFiles)
            break
          default:
            this.$message('请重启客户端后重试！')
            break
        }
      },
    }
  }
</script>