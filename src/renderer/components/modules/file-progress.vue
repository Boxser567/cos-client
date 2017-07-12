<template>
    <div class="list-progress" :class="{ 'list-none':isShowFileProgress }">
        <div class="el-side-tab">
            <div class="el-side-head clearfix" @dblclick="showFileProgress">
                <ul>
                    <li :class="{'active' : t.iscur}" @click="tabFn(t)" v-for="t in tabList">{{t.name}}</li>
                </ul>
                <div class="el-speed">
                    上传速度: <span>{{uploadSpeed | bitSpeed}} </span>
                    下载速度: <span>{{downloadSpeed | bitSpeed}} </span>
                    <i class="el-icon-d-arrow-right" :class="{ active:isShowFileProgress }"
                       @click="showFileProgress"></i>
                </div>
            </div>
            <div class="el-side-content">
                <div class="first" v-show=" tabList[0].iscur ">
                    <div class="title-bar">
                        <div class="el-button-group">
                            <el-button size="small" :plain="true" @click="uploadFileCtrl('begin')">开始</el-button>
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
                    <!--<div class="progress-file">-->

                        <div>
                        <!--<div class="progress-bar" :class="{ active:file.active }"-->
                             <!--v-for="(file, index) of uploadProgress.list"-->
                             <!--@click="selectLoadFile($event,'upload',file)" :key="file.id">-->
                            <!--<img :src="file.Key | getFileImg" alt="">-->
                            <!--<el-row>-->
                                <!--<el-col :span="12">-->
                                    <!--<p class="tl">{{file.Key}}</p>-->
                                    <!--<el-progress-->
                                            <!--:percentage="(file.loaded/file.size * 100) | getInteger"></el-progress>-->
                                <!--</el-col>-->
                                <!--<el-col :span="4">-->
                                    <!--{{file.size | bitSize}}-->
                                <!--</el-col>-->
                                <!--<el-col :span="4">-->
                                    <!--<span v-if="file.status=='wait'">等待中</span>-->
                                    <!--<span v-if="file.status=='pause'">暂停</span>-->
                                    <!--<span v-if="file.status=='complete'">完成</span>-->
                                    <!--<span v-if="file.status=='run'"> {{file.speed | bitSpeed}} </span>-->
                                    <!--<span v-if="file.status=='error'">出错</span>-->
                                <!--</el-col>-->
                                <!--<el-col :span="4">-->
                                    <!--<i class="el-icon-caret-right" v-if="file.status=='pause'"-->
                                       <!--@click="uploadFileCtrl('begin',file.id)"></i>-->
                                    <!--<i v-if="file.status == 'run'" @click="uploadFileCtrl('pause',file.id)"> || </i>-->
                                    <!--<i v-if="file.status=='error'" class="el-icon-warning"-->
                                       <!--@click="uploadFileCtrl('begin',file.id)"></i>-->
                                    <!--<i class="el-icon-close" @click="uploadFileCtrl('cancel',file.id)"></i>-->
                                <!--</el-col>-->
                            <!--</el-row>-->
                        <!--</div>-->
                        </div>
                        <upload-item></upload-item>

                    <!--</div>-->
                </div>
                <div class="second" v-show=" tabList[1].iscur ">
                    <div class="title-bar">
                        <div class="el-button-group">
                            <el-button size="small" :plain="true" @click="downloadFileCtrl('begin')">开始</el-button>
                            <el-button size="small" :plain="true" @click="downloadFileCtrl('purse')">暂停</el-button>
                            <el-button size="small" :plain="true" @click="downloadFileCtrl('cancel')">取消</el-button>
                        </div>
                        <div class="el-button-group">
                            <el-button size="small" :plain="true" @click="downloadFileCtrl('allBegin')">全部开始</el-button>
                            <el-button size="small" :plain="true" @click="downloadFileCtrl('allPurse')">全部暂停</el-button>
                            <el-button size="small" :plain="true" @click="downloadFileCtrl('allCancel')">全部取消
                            </el-button>
                            <el-button size="small" :plain="true" @click="downloadFileCtrl('clear')">清空已完成</el-button>
                        </div>
                    </div>

                    <div class="progress-file">
                        <div class="progress-bar" :class="{ active:file.active }"
                             v-for="file in downloadProgress.list"
                             @click="selectLoadFile($event,'download',file)">
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
                                    <span v-if="file.status=='wait'">等待中</span>
                                    <span v-if="file.status=='pause'">暂停</span>
                                    <span v-if="file.status=='complete'">完成</span>
                                    <span v-if="file.status=='run'">{{file.speed}} /s</span>
                                    <span v-if="file.status=='error'">出错</span>
                                </el-col>
                                <el-col :span="4">
                                    <i v-if="file.status=='purse'" class="el-icon-caret-right"
                                       @click="downloadFileCtrl('begin',file.id)"></i>
                                    <i v-if="file.status == 'run'" @click="downloadFileCtrl('purse',file.id)"> | | </i>
                                    <i v-if="file.status=='error'" class="el-icon-warning"
                                       @click="downloadFileCtrl('begin',file.id)"></i>
                                    <i class="el-icon-close" @click="downloadFileCtrl('cancel',file.id)"></i>
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
</template>

<script>

  import { mapState } from 'vuex'
  import uploadItem from './upload-item.vue'

  export default {
    name: 'fileProgress-page',
    props: ['options'],
    data() {
      return {
        tabList: [
          {iscur: true, name: '上传队列', id: 0},
          {iscur: false, name: '下载队列', id: 1},
          {iscur: false, name: '错误日志', id: 2}
        ]
      }
    },
    components: {uploadItem},
    computed: {
      ...mapState('menulist', ['uploadSpeed', 'downloadSpeed', 'downloadProgress', 'uploadProgress', 'isShowFileProgress'])
    },
    methods: {
      showFileProgress(){
        this.$store.commit('menulist/showFileProgress')
      },
      tabFn(item){
        this.tabList.forEach(function (tab) {
          tab.iscur = false
        })
        item.iscur = true
      },
      uploadFileCtrl(types, id) {
        this.$store.commit('menulist/uploadFileCtrl', {types: types, id: id})
      },
      downloadFileCtrl(types, id){
        this.$store.commit('menulist/downloadFileCtrl', {types: types, id: id})
      },
      selectLoadFile(e, types, upFile){
        e.preventDefault()
        let Arr = {
          upFile: upFile,
          key: false
        }
        if (e.shiftKey) {
          Arr.key = true
        }
        if (types === 'upload')
          this.$store.commit('menulist/selectLoadFile', Arr)
        if (types === 'download') {
          this.$store.commit('menulist/selectDownloadFile', Arr)
        }
      }
    }

  }

</script>