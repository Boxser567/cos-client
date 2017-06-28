<template>
    <div class="file-list">
        <div class="list header">
            <div class="name">文件名</div>
            <div class="size">大小</div>
            <div class="time">创建时间</div>
        </div>
        <div class="list-info" :class="{ 'list-none':listNone }" @contextmenu="openFileMenu($event)">

            <div class="file-none" v-if="filelist && filelist.length==0 && !newFolder">
                <span>没有文件</span>
            </div>

            <div class="loading" v-if="fileloading">
                <i class="el-icon-loading"></i>
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
            <div>
                <!--<el-tabs v-model="activeName2" type="card">-->
                <!--<el-tab-pane label="上传队列" name="first">-->
                <!--<div class="title-bar">-->
                <!--<div class="el-button-group">-->
                <!--<el-button size="small" :plain="true">暂停</el-button>-->
                <!--<el-button size="small" :plain="true">取消</el-button>-->
                <!--</div>-->
                <!--<div class="el-button-group">-->
                <!--<el-button size="small" :plain="true">全部开始</el-button>-->
                <!--<el-button size="small" :plain="true">全部暂停</el-button>-->
                <!--<el-button size="small" :plain="true">全部取消</el-button>-->
                <!--<el-button size="small" :plain="true">清空已完成</el-button>-->
                <!--</div>-->
                <!--</div>-->
                <!--</el-tab-pane>-->
                <!--<el-tab-pane label="下载队列" name="second">-->
                <!--<div class="title-bar">-->
                <!--<div class="el-button-group">-->
                <!--<el-button size="small" :plain="true">暂停</el-button>-->
                <!--<el-button size="small" :plain="true">取消</el-button>-->
                <!--</div>-->
                <!--<div class="el-button-group">-->
                <!--<el-button size="small" :plain="true">全部开始</el-button>-->
                <!--<el-button size="small" :plain="true">全部暂停</el-button>-->
                <!--<el-button size="small" :plain="true">全部取消</el-button>-->
                <!--<el-button size="small" :plain="true">清空已完成</el-button>-->
                <!--</div>-->
                <!--</div>-->
                <!--</el-tab-pane>-->
                <!--<el-tab-pane label="错误日志" name="third">-->
                <!--<div class="title-bar">-->
                <!--<el-button size="small" :plain="true">打开日志文件夹</el-button>-->
                <!--</div>-->
                <!--</el-tab-pane>-->
                <!--</el-tabs>-->
            </div>

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
                            <div class="progress-bar">
                                <img src="../../../../static/images/file-icon/folder32x32.png" alt="">
                                <el-row>
                                    <el-col :span="12">
                                        <p class="tl">曹操传.pdf</p>
                                        <el-progress :percentage="43"></el-progress>
                                    </el-col>
                                    <el-col :span="4">
                                        18.25MB
                                    </el-col>
                                    <el-col :span="4">
                                        00:00:08
                                    </el-col>
                                    <el-col :span="4">
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
                            <div class="progress-bar">
                                <img src="../../../../static/images/file-icon/folder32x32.png" alt="">
                                <el-row>
                                    <el-col :span="12">
                                        <p class="tl">曹操传.pdf</p>
                                        <el-progress :percentage="43"></el-progress>
                                    </el-col>
                                    <el-col :span="4">
                                        18.25MB
                                    </el-col>
                                    <el-col :span="4">
                                        00:00:08
                                    </el-col>
                                    <el-col :span="4">
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
        <ul id="bucket-menu-list" tabindex="-1" v-show="isShowList" ref="fileRight" @blur="closeFileMenu"
            :style="{top:menu.top,left:menu.left}">
            <li v-for="f in fileRightList"> {{ f.name }}</li>
        </ul>

    </div>
</template>

<script>
//  import util from '../../assets/js/util'
  import common from '../../assets/js/common'
//  import { mutations, mapState, actions } from 'vuex'
  export default {
    name: 'filelist-page',
    props: ['options', 'newfo'],
    data () {
      return {
        newFolder: false,
        listNone: false,
        isShowList: false,
        upSpeed: '-',
        loadSpeed: '-',
        folderName: '新建文件夹',
        fileloading: true,
        menu: {
          top: 0,
          left: 0
        },
        tabList: [
          {iscur: true, name: '上传队列', id: 0},
          {iscur: false, name: '下载队列', id: 1},
          {iscur: false, name: '错误日志', id: 2}
        ]
      }
    },
    computed: {
      fileRightList () {
        return this.$store.state.menulist.fileRightList
      },
      filelist () {
        return this.$store.state.menulist.filelist
      }
    },
    created () {
      this.fetchData()
    },
    watch: {
      $route: 'fetchData',
      'newfo': function (val, old) {
        if (val !== old) {
          this.newFolder = true
        }
      }
    },
    methods: {
      putBucketFn: function () {
        let _self = this
        let bk = this.options.bucket
        let rg = this.options.region
        let folder = this.folderName + '/'
        common.headBucket({'Bucket': bk, 'Region': rg}, function (hd) {
          if (hd.BucketExist) {
            this.$message.error('bucket名称重复，请重新输入!')
          } else {
            common.putObject({'Bucket': bk, 'Region': rg, 'Key': folder}, function (res) {
              _self.fetchData()
              _self.newFolder = false
              _self.folderName = '新建文件夹'
            })
          }
        })
      },
      fetchData () {
        let bk = this.options.bucket
        let rg = this.options.region
        this.fileloading = true
        if (bk && rg) {
          let params = {Bucket: bk, Region: rg}
          if (this.options.folders && this.options.folders.length) {
            params.Prefix = this.options.folders
          }
          this.$store.dispatch('menulist/getFileList', {pms: params}).then(() => (this.fileloading = false))
        }
      },
      itemSelect (Name) {
        this.$store.commit('menulist/choosedFile', {fileName: Name})
      },
      tabFn (item) {
        this.tabList.forEach(function (tab) {
          tab.iscur = false
        })
        item.iscur = true
      },
      goFolder (e, file) {
        if (!file.dir) return
        this.options.folders = file.Prefix
        let pms = {bucket: this.options.bucket, region: this.options.region, folders: this.options.folders}
        this.$router.push({
          path: '/file/' + this.options.bucket,
          query: pms
        })
      },
      openFileMenu (e) {
        let currentDom = e.target
        for (let i = 0; i < 5; i++) {
          if (currentDom.classList.contains('file-list-info')) {
            let currentFileName = currentDom.getAttribute('currentFileName')
            if (currentFileName) {
              this.$store.commit('menulist/choosedFile', {fileName: currentFileName})
            }
            break
          }
          currentDom = currentDom.parentNode
        }

        let _self = this
        this.$nextTick(function () {
          _self.$refs.fileRight.focus()
          let top = e.y - 90
          let left = e.x - 225
          let largestHeight = window.innerHeight - _self.$refs.fileRight.offsetHeight - 25
          let largestWidth = window.innerWidth - _self.$refs.fileRight.offsetWidth - 225
          if (top > largestHeight) top = largestHeight
          if (left > largestWidth) left = largestWidth
          _self.menu.top = top + 'px'
          _self.menu.left = left + 'px'
          _self.isShowList = true
        })
        e.preventDefault()
      },
      closeFileMenu () {
        this.isShowList = false
      }
    }
  }
</script>
