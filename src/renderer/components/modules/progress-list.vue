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
        <virtual-scroller class="scroller progress-file" :items="showList" item-height="40" content-tag="div">
            <template scope="props">
                <div class="progress-bar" :key="props.item.id" :class="{ active: props.item.active }"
                     @click="select($event, props.item)">
                    <img :src="props.item.Key | getFileImg" alt="">
                    <el-row>
                        <el-col :span="12">
                            <p class="tl">{{props.item.Key}}</p>
                            <el-progress
                                    :percentage="(props.item.loaded/props.item.size * 100) | getInteger"></el-progress>
                        </el-col>
                        <el-col :span="4">
                            {{props.item.size | bitSize}}
                        </el-col>
                        <el-col :span="4">
                            <span v-if="props.item.status=='wait'">等待中</span>
                            <span v-if="props.item.status=='pause'">暂停</span>
                            <span v-if="props.item.status=='complete'">完成</span>
                            <span v-if="props.item.status=='run'"> {{props.item.speed | bitSpeed}} </span>
                            <span v-if="props.item.status=='error'">出错</span>
                        </el-col>
                        <el-col :span="4">
                            <i v-if="props.item.status == 'pause'" class="el-icon-caret-right"
                               @click="send('begin', 'one', props.item.id)"></i>
                            <i v-if="props.item.status == 'run'"
                               @click="send('pause', 'one', props.item.id)"> || </i>
                            <i v-if="props.item.status == 'error'" class="el-icon-warning"
                               @click="send('begin', 'one', props.item.id)"></i>
                            <i class="el-icon-close"
                               @click="send('delete', 'one', props.item.id)"></i>
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
    props: ['list', 'type'],
    data () {
      return {
        selected: [],
        normaliseList: [],
        showList: []
      }
    },
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
    watch: {
      list: function (val) {
        let i = 0
        for (let v of val) {
          while (i < v.id) {
            if (this.normaliseList[i]) {
              console.debug(`${this.type} normaliseList del id = ${i}`)
              delete this.normaliseList[i]
            }
            i++
          }
          if (!this.normaliseList[i]) {
            console.debug(`${this.type} normaliseList add id = ${i}`)
            Vue.set(this.normaliseList, i, v)
            i++
            continue
          }
          if (v.modify || v.status === 'run') {
            console.debug(`${this.type} normaliseList mod id = ${i}`)
            this.normaliseList[i].status = v.status
            this.normaliseList[i].size = v.size
            this.normaliseList[i].loaded = v.loaded
            this.normaliseList[i].speed = v.speed
          }
          i++
        }
        while (i < this.normaliseList.length) {
          if (this.normaliseList[i]) {
            console.debug(`${this.type} normaliseList del id = ${i}`)
            delete this.normaliseList[i]
          }
          i++
        }
        this.refresh()
      }
    },
    methods: {
      refresh: function () {
        let arr = []
        for (let v of this.normaliseList) {
          if (v) {
            arr.push(v)
          }
        }
        console.log(`refresh ${this.type} showList.length = ${arr.length}`)
        this.showList = arr
      },
      select (event, item) {
        event.preventDefault()
        if (!event.shiftKey) {
          if (this.selected.length === 1 && this.selected[0] === item.id) {
            this.selected = []
            this.normaliseList[item.id].active = false
            return
          }
          this.normaliseList.forEach(v => { if (v) Vue.set(v, 'active', false) })
          this.selected = [item.id]
          Vue.set(this.normaliseList[item.id], 'active', true)
          return
        }
        let start = this.showList[0].id
        let isStart
        if (this.selected.length !== 0) {
          start = Math.min(...this.selected)
        }
        this.selected = []
        this.normaliseList.forEach(v => { Vue.set(v, 'active', false) })
        for (let v of this.normaliseList) {
          if (v.id >= start) {
            isStart = true
          }
          if (isStart) {
            Vue.set(v, 'active', true)
            this.selected.push(v.id)
          }
          if (v.id >= item.id) break
        }
        this.refresh()
      },
      send (type, range, id) {
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
