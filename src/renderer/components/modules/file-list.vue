<template>
    <div class="file-list">
        <div class="list header">
            <div class="name">文件名</div>
            <div class="size">大小</div>
            <div class="time">更新时间</div>
        </div>
        <div class="list-info" id="menuinfo" @click.self="fileContentClick()" @contextmenu.self="openMenu()">

            <div class="loading" v-if="fileloading">
                <i class="el-icon-loading"></i>
            </div>

            <div class="file-none" v-if="filelist && filelist.length==0 && !newFolder && !fileloading"
                 @contextmenu="openMenu()">
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
                 v-for="(f, $index) in filelist"
                 @click="itemSelect($event, $index, f)"
                 @dblclick="goFolder(f)"
                 @contextmenu="openMenu(f, $index)"
                 :key="f.Name">
                <div class="name">
                    <img :src="f | getFileImg" alt="">
                    <p>{{ f.Name }}</p>
                </div>
                <div class="size">{{ f.Size | bitSize }}</div>
                <div class="time">{{ f.LastModified | getDate }}</div>
            </div>
        </div>
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
      for (let item of this.fileRightList) {
        menu.append(new MenuItem({label: item.name, click () { vue.rightClickFn(item.key) }}))
      }
    },

    watch: {
      $route: 'fetchData'
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
      fileContentClick () {
        this.$store.commit('menulist/unSelectFile')
      },
      // 双击文件夹
      goFolder (file) {
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
      openMenu (cfile, index) {
        if (!cfile) {
          this.$store.commit('menulist/unSelectFile')
          this.popMenu('blanks')
          return
        }

        if (this.selectFile &&
          this.selectFile.length > 1 &&
          this.selectFile.some(x => x.Name === cfile.Name)) {
          // 右键选中多个文件
          let array = this.selectFile.map(n => !!n.dir)

          if (array.includes(false) && (!array.includes(true))) {
            this.popMenu('groupFile')
            return
          }
          this.popMenu('folders')
          return
        }

        this.$store.commit('menulist/unSelectFile')
        this.$store.commit('menulist/selectFile', {file: cfile, index: index})

        if (cfile.dir) {
          this.popMenu('folders')
          return
        }
        this.popMenu('files')
      },

      popMenu (type) {
        for (let m of this.fileRightList) {
          if (m.key === 'paste_file') {
            menu.items[m.index - 1].visible = !!this.copyFiles.list.length
            continue
          }
          menu.items[m.index - 1].visible = this.menu[type].includes(m.key)
        }
        menu.popup(remote.getCurrentWindow(), {async: true})
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
            this.$emit('deleteObj')
            break
          case 'get_address':
            break
          case 'set_http':
            break
          case 'set_limit':
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