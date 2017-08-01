<template>
    <div class="file-list">
        <div class="list header">
            <div class="name">文件名</div>
            <div class="size">大小</div>
            <div class="time">更新时间</div>
        </div>
        <div class="list-info" id="menuinfo" @click="fileContentClick($event)" @contextmenu="openFileMenu($event)">

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
                 :key="f.Name">
                <div class="name">
                    <img :src="f | getFileImg" alt="">
                    <p>{{ f.Name }}</p>
                </div>
                <div class="size">{{f.Size | bitSize}}</div>
                <div class="time">{{ f.LastModified | getDate }}</div>
            </div>
        </div>


        <!--文件右键列表信息-->
        <ul id="bucket-menu-list" tabindex="-1" v-show="isShowList" ref="fileRight"
            :style="{top:menu.top,left:menu.left}">
            <li v-for="f in menu.list" @click="rightClickFn(f.key)"> {{ f.name }}</li>
        </ul>

    </div>
</template>

<script>
  import { mapState } from 'vuex'
  import { remote } from 'electron'
  const {Menu, MenuItem} = remote

  const menu = new Menu()

  export default {
    name: 'filelist-page',
    props: ['options'],

    data () {
      return {
        isShowList: false, // 右键菜单的显示
        folderName: '新建文件夹',
        menu: {
          list: null,
          top: 0,
          left: 0,
          files: ['download_file', 'copy_file', 'delete_file', 'get_address', 'set_http', 'set_limit'],
          folders: ['download_file', 'copy_file', 'delete_file', 'set_limit'],
          blanks: ['upload_file', 'new_folder', 'download_list'],
          groupFile: ['download_file', 'copy_file', 'delete_file', 'set_http']
        }
      }
    },

    computed: {
      ...mapState('menulist', ['fileRightList', 'filelist', 'fileloading', 'selectFile', 'newFolder', 'copyFiles'])
    },
    created () {
      this.fetchData()
      let vue = this
      menu.append(new MenuItem({label: '上传文件', click () { vue.rightClickFn('upload_file') }}))
      menu.append(new MenuItem({label: '创建文件夹', click () { vue.rightClickFn('new_folder') }}))
      menu.append(new MenuItem({label: '下载', click () { vue.rightClickFn('download_file') }}))
      menu.append(new MenuItem({label: '复制', click () { vue.rightClickFn('copy_file') }}))
      menu.append(new MenuItem({label: '删除', click () { vue.rightClickFn('delete_file') }}))
      menu.append(new MenuItem({label: '获取地址', click () { vue.rightClickFn('get_address') }}))
      menu.append(new MenuItem({label: '设置HTTP头', click () { vue.rightClickFn('set_http') }}))
      menu.append(new MenuItem({label: '设置权限', click () { vue.rightClickFn('set_limit') }}))
      menu.append(new MenuItem({label: '粘贴', click () { vue.rightClickFn('paste_file') }}))
      menu.append(new MenuItem({label: '下载当前目录', click () { vue.rightClickFn('download_list') }}))
    },

    watch: {
      $route: 'fetchData',
      copyFiles: {
        handler: function (val) {
          let exst = this.menu.files.indexOf('paste_file') > -1
          if (val && val.list.length) {
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
        },
        deep: true
      }
    },

    methods: {
      addFolderFn: function () { // 新建文件夹
        let bk = this.options.bucket
        let rg = this.options.region
        let folder = this.options.folders ? this.options.folders + this.folderName + '/' : this.folderName + '/'
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

      fetchData () { // 渲染页面
        if (!this.options.bucket || !this.options.region) return
        let params = {Bucket: this.options.bucket, Region: this.options.region}
        if (this.options.folders && this.options.folders.length) {
          params.Prefix = this.options.folders
        }
        this.$store.dispatch('menulist/getFileList', params).then(() => { })
      },

      // 文件选择
      itemSelect (e, index, file) {
        this.$store.commit('menulist/selectFile', {
          file: file,
          key: e.shiftKey,
          index: index
        })
      },

      // 文件空白处单击
      fileContentClick (e) {
        if (e.target.classList.contains('list-info')) {
          this.$store.commit('menulist/unSelectFile')
        }
      },
      // 双击文件夹
      goFolder (e, file) {
        if (!file.dir) return
        this.options.folders = file.Prefix
        this.options.keyWord = null
        this.$router.push({
          path: '/file/' + this.options.bucket,
          query: {
            bucket: this.options.bucket,
            region: this.options.region,
            folders: this.options.folders
          }
        })
      },

      // 创建并显示右键菜单
      openFileMenu (e) {
        let currentDom = e.target

        if (currentDom.classList.contains('list-info') || currentDom.classList.contains('file-none')) { // 右键空白
          this.$store.commit('menulist/unSelectFile')
          this.menu.list = this.fileRightList.filter((m) => {
            if (this.menu.blanks.includes(m.key)) {
              return m
            }
          })
        } else {
          let cfile = null
          let index = null
          for (let i = 0; i < 5; i++) {
            if (currentDom.classList.contains('file-list-info')) {
              index = currentDom.getAttribute('index')
              if (index !== undefined) {
                cfile = this.filelist[index]
              }
              break
            }
            currentDom = currentDom.parentNode
          }

          if (this.selectFile && this.selectFile.length > 1) {
            if (!(cfile && index)) return
            let temper = this.selectFile.some(x => x.Name === cfile.Name)
            if (temper) { // 右键选中多个文件
              let array = this.selectFile.map(n => !!n.dir)

              if (array.includes(false) && (!array.includes(true))) {
                this.menu.list = this.fileRightList.filter((m) => {
                  if (this.menu.groupFile.includes(m.key)) {
                    return m
                  }
                })
              } else {
                this.menu.list = this.fileRightList.filter((m) => {
                  if (this.menu.folders.includes(m.key) && m.key !== 'set_limit') {
                    return m
                  }
                })
              }
            } else {
              this.$store.commit('menulist/unSelectFile')
              this.$store.commit('menulist/selectFile', {file: cfile, index: index})

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
          } else {
            if (cfile && index) {
              this.$store.commit('menulist/unSelectFile')
              this.$store.commit('menulist/selectFile', {file: cfile, index: index})

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
        menu.items.forEach(item => {
          item.visible = this.menu.list.some(t => t.name === item.label)
        })
        menu.popup(remote.getCurrentWindow(), {async: true})
        e.preventDefault()
      },

      // 关闭右键菜单
      closeFileMenu () {
        this.isShowList = false
        document.removeEventListener('click', this.closeFileMenu)
      },

      // 右键菜单点击事件
      rightClickFn (item) {
        if (!item) return
        let pms = {
          Bucket: this.options.bucket,
          Region: this.options.region,
          Prefix: (this.options.folders && this.options.folders.length > 0) ? this.options.folders : ''
        }

        switch (item) {
          case 'upload_file' : // 上传文件
            this.$store.commit('menulist/uploadFile', pms)
            break
          case 'new_folder': // 新建文件夹
            this.$store.commit('menulist/newFolder', true)
            break
          case 'new_folder_cancel':
            this.$store.commit('menulist/newFolder', false)
            break
          case 'download_file':
            this.$store.commit('menulist/downloadFile', pms)
            break
          case 'delete_file':
            this.$emit('sendObj', 'delete_file')
            break
          case 'get_address':
            this.$emit('sendObj', 'get_address')
            break
          case 'set_http':
            this.$emit('sendObj', 'set_http')
            break
          case 'set_limit':
            this.$emit('sendObj', 'set_limit')
            break
          case 'copy_file': // 复制
            this.$store.commit('menulist/copyFiles', pms)
            break
          case 'paste_file': // 粘贴
            if (pms.Bucket === this.copyFiles.src.Bucket && pms.Prefix === this.copyFiles.src.Prefix) {
              this.$message('路径相同，不能操作')
              return
            }
            this.$store.dispatch('menulist/pasteFiles', pms).then(() => {
              this.fetchData()
              this.$store.commit('menulist/copyFilesNone')
            })
            break
          case 'download_list':
            break
          default:
            this.$message('请重启客户端后重试！')
            break
        }
      }
    }
  }
</script>