<template>
    <div>
        <div class="title-bar">
            <div class="el-button-group">
                <el-button size="small" :plain="true" @click="send('begin','select')">开始</el-button>
                <el-button size="small" :plain="true" @click="send('pause','select')">暂停</el-button>
                <el-button size="small" :plain="true" @click="send('delete','select')">取消</el-button>
            </div>
            <div class="el-button-group">
                <el-button size="small" :plain="true" @click="send('begin','all')">全部开始
                </el-button>
                <el-button size="small" :plain="true" @click="send('pause','all')">全部暂停
                </el-button>
                <el-button size="small" :plain="true" @click="cancelAll()">全部取消
                </el-button>
                <el-button size="small" :plain="true" @click="clearAll()">清空已完成</el-button>
            </div>
        </div>
        <virtual-scroller class="scroller progress-file" :items="list" item-height="40" content-tag="div">
            <template scope="file">
                <div class="progress-bar" :key="file.item.id" :class="{ active: file.item.active }"
                     @click="select($event, file.item)">
                    <img :src="file.item.Key | getFileImg" alt="">
                    <el-row>
                        <el-col :span="12">
                            <p class="tl">{{file.item.Key}}</p>
                            <el-progress
                                    :percentage="(file.item.loaded/file.item.size * 100) | getInteger"></el-progress>
                        </el-col>
                        <el-col :span="4">
                            {{file.item.size | bitSize}}
                        </el-col>
                        <el-col :span="4">
                            <span v-if="file.item.status=='wait'">等待中</span>
                            <span v-if="file.item.status=='pause'">暂停</span>
                            <span v-if="file.item.status=='complete'">完成</span>
                            <span v-if="file.item.status=='run'"> {{file.item.speed | bitSpeed}} </span>
                            <span v-if="file.item.status=='error'">出错</span>
                        </el-col>
                        <el-col :span="4">
                            <i v-if="file.item.status == 'pause'" class="el-icon-caret-right"
                               @click="send('begin', 'one', file.item.id)"></i>
                            <i v-if="file.item.status == 'run'"
                               @click="send('pause', 'one', file.item.id)"> || </i>
                            <i v-if="file.item.status == 'error'" class="el-icon-warning"
                               @click="send('begin', 'one', file.item.id)"></i>
                            <i class="el-icon-close"
                               @click="send('delete', 'one', file.item.id)"></i>
                        </el-col>
                    </el-row>
                </div>
            </template>
        </virtual-scroller>
    </div>
</template>

<script>
  import Vue from 'vue'
  import { ipcRenderer } from 'electron'

  export default {
    name: 'progress-list',
    computed: {
      channels () {
        switch (this.type) {
          case 'upload':
            return {
              resume: 'ResumeUploadTask',
              pause: 'PauseUploadTasks',
              delete: 'DeleteUploadTasks'
            }
          case 'download':
            return {
              resume: 'ResumeDownloadTask',
              pause: 'PauseDownloadTasks',
              delete: 'DeleteDownloadTasks'
            }
        }
      }
    },
    props: ['list', 'type'],
    data () {
      return {
        selected: []
      }
    },
    methods: {
      select (event, item) {
        event.preventDefault()
        if (!event.shiftKey) {
          if (this.selected.length === 1 && this.selected[0] === item.id) {
            this.selected = []
            item.active = false
            return
          }
          this.list.forEach(v => { Vue.set(v, 'active', false) })
          this.selected = [item.id]
          Vue.set(item, 'active', true)
          return
        }
        let start = this.list[0].id
        let isStart
        if (this.selected.length !== 0) {
          start = Math.min(...this.selected)
        }
        this.selected = []
        this.list.forEach(v => { Vue.set(v, 'active', false) })
        for (let v of this.list) {
          if (v.id >= start) {
            isStart = true
          }
          if (isStart) {
            Vue.set(v, 'active', true)
            this.selected.push(v.id)
          }
          if (v.id >= item.id) break
        }
      },
      send (type, range, id) {
        console.log('send', type, range, id)
        let msg = {tasks: []}
        switch (range) {
          case 'select':
            msg = {tasks: this.selected}
            break
          case 'all':
            this.list.forEach(v => {
              msg.tasks.push(v.id)
            })
            break
          case 'one':
            msg = {tasks: [id]}
        }
        switch (type) {
          case 'begin':
            // 'ResumeUploadTask'
            ipcRenderer.send(this.channels.resume, msg)
            break
          case 'pause':
            // 'PauseUploadTasks'
            ipcRenderer.send(this.channels.pause, msg)
            break
          case 'delete':
            // 'DeleteUploadTasks'
            ipcRenderer.send(this.channels.delete, msg)
        }
      },
      cancelAll () {
        let msg = {tasks: []}

        this.list.forEach((v) => {
          if (v.status === 'complete') return
          msg.tasks.push(v.id)
        })

        ipcRenderer.send(this.channels.delete, msg)
      },
      clearAll () {
        let msg = {tasks: []}

        this.list.forEach((v) => {
          if (v.status !== 'complete') return
          msg.tasks.push(v.id)
        })

        ipcRenderer.send(this.channels.delete, msg)
      }
    }
  }
</script>
