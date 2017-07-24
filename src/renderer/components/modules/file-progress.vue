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
                    <progress-list :list="uploadList" :type="'upload'"></progress-list>
                </div>
                <div class="second" v-show=" tabList[1].iscur ">
                    <progress-list :list="downloadList" :type="'download'"></progress-list>
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
  import progressList from './progress-list.vue'
  import { ipcRenderer } from 'electron'

  export default {
    name: 'fileProgress-page',
    props: ['options'],
    data () {
      return {
        tabList: [
          {iscur: true, name: '上传队列', id: 0},
          {iscur: false, name: '下载队列', id: 1},
          {iscur: false, name: '错误日志', id: 2}
        ],
        uploadList: [],
        downloadList: []
      }
    },
    created () {
      ipcRenderer.send('GetUploadTasks')
      ipcRenderer.on('GetUploadTasks-data', (event, data) => {
        console.log('GetUploadTasks-data', data.length)
        this.uploadList = data
      })

      ipcRenderer.send('GetDownloadTasks')
      ipcRenderer.on('GetDownloadTasks-data', (event, data) => {
        console.log('GetDownloadTasks-data', data.length)
        this.downloadList = data
      })
    },
    components: {progressList},
    computed: {
      ...mapState('menulist', ['uploadSpeed', 'downloadSpeed', 'isShowFileProgress'])
    },
    methods: {
      showFileProgress () {
        this.$store.commit('menulist/showFileProgress')
      },
      tabFn (item) {
        this.tabList.forEach(tab => { tab.iscur = false })
        item.iscur = true
      }
    }
  }
</script>