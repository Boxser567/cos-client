<template>
    <div class="file-list">
        <div class="list header">
            <div class="name">文件名</div>
            <div class="time">创建时间</div>
            <div class="size">大小</div>
        </div>
        <div class="operat-warn" v-if="operatWarn">
            <i class="el-icon-information"></i>小技巧：使用Shift键可以实现多选操作; 拖拽本地文件到文件列表区域可以上传。<span
                @click="neverWarn">不再提示</span>
        </div>
        <div class="list-info" id="menuinfo"
             :class="{ 'topx': operatWarn}"
             @click.self="fileContentClick()"
             @contextmenu="openMenu()"
             @dragover.prevent="dropable = true"
        >
            <div class="dropable" v-if="dropable"
                 @dragleave.prevent="dropable = false"
                 @drop.prevent="onDrop"
            >
                <div class="con">
                    <i class="el-icon-upload"></i>
                    <p>将文件拖拽到此处上传</p>
                </div>
            </div>
            <div class="loading" v-if="fileloading">
                <i class="el-icon-loading"></i>
            </div>

            <div class="file-none" v-if="filelist && filelist.length==0 && !newFolder && !fileloading"
                 @contextmenu.stop="openMenu()">
                <span>没有文件</span>
            </div>

            <div class="new-file" v-if="newFolder">
                <img src="../../../../static/images/file-icon/folder32x32.png" alt="">
                <el-row>
                    <el-col :span="8">
                        <el-input size="small" id="inputAddFolder"
                                  v-model="folderName" v-focus="true"></el-input>
                    </el-col>
                    <el-col :span="8">
                        <el-button size="small" @click="addFolderFn">确定</el-button>
                        <el-button type="primary" size="small" @click="rightClickFn('new_folder_cancel')">取消</el-button>
                    </el-col>
                </el-row>
            </div>

            <virtual-scroller v-if="filelist && filelist.length"
                              :items="filelist" item-height="34" content-tag="div">
                <template scope="props">
                    <div class="list file-list-info" :class="{ active:props.item.active }"
                         @click="itemSelect($event, props.itemIndex, props.item)"
                         @dblclick="goFolder(props.item)"
                         @contextmenu.stop="openMenu(props.item, props.itemIndex)"
                         :key="props.item.Key">
                        <div class="name">
                            <img :src="props.item | getFileImg" alt="">
                            <p>{{ props.item.Name }}</p>
                        </div>
                        <div class="time">{{ props.item.LastModified | getDate }}</div>
                        <div class="size">{{ props.item.Size | bitSize }}</div>
                    </div>
                </template>
            </virtual-scroller>
        </div>
    </div>
</template>

<script>
  import { mapState } from 'vuex'
  import { remote } from 'electron'

  const {Menu, MenuItem} = remote

  let menu

  const contextMenu = [
    {
      key: 'upload_file',
      name: '上传文件'
    },
    {
      key: 'new_folder',
      name: '创建文件夹'
    },
    {
      key: 'download_file',
      name: '下载'
    },
    {
      key: 'copy_file',
      name: '复制'
    },
    {
      key: 'delete_file',
      name: '删除'
    },
    {
      key: 'get_address',
      name: '获取地址'
    },
    {
      key: 'set_http',
      name: '设置HTTP头'
    },
    {
      key: 'set_limit',
      name: '设置权限'
    },
    {
      key: 'paste_file',
      name: '粘贴'
    },
    {
      key: 'download_list',
      name: '下载当前目录'
    }
  ]

  export default {
    name: 'filelist-page',

    data () {
      return {
        folderName: '新建文件夹',
        menu: {
          list: null,
          top: 0,
          left: 0,
          files: ['download_file', 'copy_file', 'delete_file', 'get_address', 'set_limit'], //'set_http',
          folders: ['download_file', 'copy_file', 'delete_file'],
          blanks: ['upload_file', 'new_folder', 'download_list'],
          groupFile: ['download_file', 'copy_file', 'delete_file'] // 'set_http'
        },
        dropable: false,
        operatWarn: true
      }
    },

    computed: {
      ...mapState('menulist', ['filelist', 'fileloading', 'selectFile', 'newFolder', 'copyFiles', 'options', 'search'])
    },

    created () {
      menu = new Menu()
      let vue = this
      for (let item of contextMenu) {
        menu.append(new MenuItem({label: item.name, click () { vue.rightClickFn(item.key) }}))
      }

      if (localStorage.getItem('gkOperatWarn')) {
        this.operatWarn = false
      }
    },

    methods: {
      neverWarn(){
        localStorage.setItem('gkOperatWarn', true)
        this.operatWarn = false
      },
      onDrop (e) {
        let files = e.dataTransfer.files
        if (files.length === 0) return
        files = Array.from(files)
        let fileArray = files.map(n => {
          return n.path
        })
        this.$store.dispatch('menulist/uploadFileByDrag', fileArray)
        this.dropable = false
      },
      addFolderFn: function () { // 新建文件夹
        let nameRge = /^[\u4e00-\u9fff\w]{1,20}$/
        if (!nameRge.test(this.folderName)) {
          this.$message('可用数字、中英文及下划线组合,最多支持20字符')
          return
        }

        let parms = {
          Bucket: this.options.Bucket,
          Region: this.options.Region,
          Key: this.options.Prefix + this.folderName + '/'
        }
        console.log(132222332, parms)

        this.$store.dispatch('menulist/mkDir', parms).then(() => {
          this.$store.dispatch('menulist/getFileList')
          this.$store.commit('menulist/newFolder', false)
          this.folderName = '新建文件夹'
        })
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
        this.$router.push({
          path: '/file/' + this.options.Bucket,
          query: {
            Region: this.options.Region,
            Prefix: file.Prefix,
            keyWord: ''
          }
        })
      },
      // 创建并显示右键菜单
      openMenu (cfile, index) {
        if (!cfile) {
          this.$store.commit('menulist/unSelectFile')
          if (this.search.active) return
          this.popMenu('blanks')
          return
        }

        // 右键选中多个文件
        if (this.selectFile &&
          this.selectFile.length > 1 &&
          this.selectFile.some(x => x.Name === cfile.Name)) {
          let array = this.selectFile.map(n => !!n.dir)

          if (array.includes(false) && (!array.includes(true))) {
            this.popMenu('groupFile')
            return
          }
          this.popMenu('folders')
          return
        }

        this.$store.commit('menulist/selectFile', {file: cfile, index: index})

        if (cfile.dir) {
          this.popMenu('folders')
          return
        }
        this.popMenu('files')
      },

      popMenu (type) {
        console.log(this.$refs.virtualmenu)
        if (type === 'blanks') {
          if (this.filelist.length === 0) {
            this.menu[type].length = 2
          }
        }
        for (let i = 0; i < contextMenu.length; i++) {
          let m = contextMenu[i]
          if (m.key === 'paste_file') {
            menu.items[i].visible = !!this.copyFiles.list.length
            continue
          }
          menu.items[i].visible = this.menu[type].includes(m.key)
        }
        menu.popup(remote.getCurrentWindow(), {async: true})
      },
      // 右键菜单点击事件
      rightClickFn (item) {
        switch (item) {
          case 'upload_file' : // 上传文件
            this.$emit('sendObj', 'upload_file')
            break
          case 'new_folder': // 新建文件夹
            this.$emit('sendObj', 'new_folder')
            break
          case 'new_folder_cancel':
            this.$store.commit('menulist/newFolder', false)
            break
          case 'download_file':
            this.$emit('sendObj', 'download_file')
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
            this.$emit('sendObj', 'copy_file')
            break
          case 'paste_file': // 粘贴
            this.$store.dispatch('menulist/pasteFiles').catch((e) => {
              console.error(e)
              this.$message('路径相同，不能操作')
            })
            break
          case 'download_list': // 下载当前目录
            this.$emit('sendObj', 'download_list')
            break
          default:
            this.$message('请重启客户端后重试！')
        }
      }
    },
    directives: {
      focus: {
        inserted (el, binding) {
          // if (binding.value === binding.oldValue) return
          let ipt = el.getElementsByTagName('input')
          if (ipt[0]) {
            ipt[0].focus()
            ipt[0].select()
          }
        }
      }
    }
  }
</script>
