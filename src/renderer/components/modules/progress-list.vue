<template>
    <div>
        <div class="title-bar">
            <div v-if="platform === 'other'" class="full-win-btn">
                <span @click="windCtrl('mini')" class="btn-p1"><i></i></span>
                <span @click="windCtrl('maxi')" class="btn-p2"><i></i></span>
                <span @click="windCtrl('close')" class="btn-p3"><i></i></span>
            </div>
            <div class="el-button-group select-btn">
                <el-button size="small" v-show="!btnDisabled.begin || btnDisabled.pause" :disabled="btnDisabled.begin"
                           :plain="true" @click="send('begin','select')">
                    开始
                </el-button>
                <el-button size="small" v-show="!btnDisabled.pause" :disabled="btnDisabled.pause" :plain="true"
                           @click="send('pause','select')">
                    暂停
                </el-button>
                <el-button size="small" v-show="!btnDisabled.cancel || btnDisabled.delete"
                           :disabled="btnDisabled.cancel" :plain="true"
                           @click="send('delete','select')">取消
                </el-button>
                <el-button size="small" v-show="!btnDisabled.delete" :disabled="btnDisabled.delete" :plain="true"
                           @click="send('delete','select')">移除
                </el-button>

            </div>
            <div class="el-button-group">
                <el-button size="small" :disabled="btnAllDis" :plain="true" @click="send('begin','all')">全部开始
                </el-button>
                <el-button size="small" :disabled="btnAllDis" :plain="true" @click="send('pause','all')">全部暂停
                </el-button>
                <el-button size="small" :disabled="btnAllDis" :plain="true" @click="cancelAll()">全部取消
                </el-button>
                <el-button size="small" :disabled="btnAllDis" :plain="true" @click="clearAll()">清空已完成</el-button>
            </div>
        </div>
        <virtual-scroller class="scroller progress-file" :items="showList" item-height="40" content-tag="div">
            <template scope="props">
                <div class="progress-bar" :key="props.item.id" :class="{ active: props.item.active }"
                     @click="select($event, props.item)">
                    <div class="content">
                        <img :src="props.item | getFileImg" alt="">
                        <el-row>
                            <el-col :span="12">
                                <p class="tl" :title="props.item.Key">{{props.item.Key}}</p>
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
                                <i v-if="props.item.status == 'pause'" class="begin"
                                   @click.stop="send('begin', 'one', props.item.id)"></i>
                                <i v-if="props.item.status == 'run'" class="pause"
                                   @click.stop="send('pause', 'one', props.item.id)"></i>
                                <i v-if="props.item.status == 'error'" class="error"
                                   @click.stop="send('begin', 'one', props.item.id)" :title="props.item.errorMsg"></i>
                                <i class="close" @click.stop="send('delete', 'one', props.item.id)"></i>
                            </el-col>
                        </el-row>
                    </div>

                    <div class="diff p" :style="{ width: props.item.strokeWidth }"
                         v-if="props.item.status =='pause'"></div>
                    <!---->
                    <div class="diff r"
                         :style="{ width: props.item.strokeWidth }"
                         v-if="props.item.status=='run'"></div>
                    <div class="diff e"
                         :style="{ width: props.item.strokeWidth}"
                         v-if="props.item.status=='error'"></div>
                </div>
            </template>
        </virtual-scroller>
    </div>
</template>

<script>
  import { ipcRenderer, remote } from 'electron'

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
      platform(){
        return this.$store.state.platform
      },
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
      },
      btnDisabled () {
        let allTrue = {
          begin: true,
          pause: true,
          delete: true,
          cancel: true
        }
        let check = (status) => {
          switch (status) {
            case 'wait':
            case 'run':
              return {
                begin: true,
                pause: false,
                delete: true,
                cancel: false
              }
            case 'pause':
              return {
                begin: false,
                pause: true,
                delete: true,
                cancel: false
              }
            case 'complete':
              return {
                begin: true,
                pause: true,
                delete: false,
                cancel: true
              }
            case 'error':
              return {
                begin: false,
                pause: true,
                delete: false,
                cancel: true
              }
          }
        }
        if (this.selected.length === 0) return allTrue
        if (this.selected.length === 1) {
          let item = this.normaliseList[this.selected[0]]
          if (!item) return allTrue
          return check(item.status)
        }
        let st = ''
        for (let id of this.selected) {
          if (!this.normaliseList[id]) continue
          if (!st) {
            st = this.normaliseList[id].status
            continue
          }
          if (this.normaliseList[id].status !== st) {
            return allTrue
          }
        }
        return check(st)
      },
      btnAllDis () {
        return !this.showList.length
      }
    },
    watch: {
      list: function (val) {
        let i = 0
        let dirty = false
        let speed = 0
        for (let v of val) {
          if (typeof v.speed === 'number' && v.status === 'run') speed += v.speed
          v.strokeWidth = v.size === 0 ? '100%' : parseInt(v.loaded / v.size * 100) + '%'
          while (i < v.id) {
            if (this.normaliseList[i]) {
              dirty = true
              // console.debug(`${this.type} normaliseList - id = ${i}`)
              delete this.normaliseList[i]
            }
            i++
          }
          if (!this.normaliseList[i]) {
            dirty = true
            // console.debug(`${this.type} normaliseList + id = ${i}`)
            this.$set(this.normaliseList, i, v)
            i++
            continue
          }
          if (v.modify || v.status === 'run') {
            // console.debug(`${this.type} normaliseList * id = ${i}`)
            this.normaliseList[i].status = v.status
            this.normaliseList[i].size = v.size
            this.normaliseList[i].loaded = v.loaded
            this.normaliseList[i].speed = v.speed
            this.normaliseList[i].strokeWidth = v.strokeWidth
            if (v.status === 'error') {
              this.$set(this.normaliseList[i], 'errorMsg', v.errorMsg)
            }
          }
          i++
        }
        while (i < this.normaliseList.length) {
          if (this.normaliseList[i]) {
            dirty = true
            // console.debug(`${this.type} normaliseList - id = ${i}`)
            delete this.normaliseList[i]
          }
          i++
        }
        if (dirty) {
          this.refresh()
        }
        this.$emit('speed', speed)
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
        // console.log(`refresh ${this.type} showList.length = ${arr.length}`)
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
          this.selected.forEach(id => {
            let v = this.normaliseList[id]
            if (v) this.$set(v, 'active', false)
          })
          this.selected = [item.id]
          this.$set(this.normaliseList[item.id], 'active', true)
          return
        }
        let start = this.selected.length === 0 ? this.showList[0].id : this.selected[0]
        this.selected.forEach(id => {
          let v = this.normaliseList[id]
          if (v) this.$set(v, 'active', false)
        })
        this.selected = []
        for (let i = start; i <= item.id; i++) {
          let v = this.normaliseList[i]
          if (!v) continue
          this.$set(v, 'active', true)
          this.selected.push(v.id)
        }
      },
      send (type, range, id) {
        let msg = {tasks: []}
        switch (range) {
          case 'select':
            msg = {tasks: this.selected}
            break
          case 'all':
            msg.all = true
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
        this.$confirm('确定全部取消吗？').then(() => {
          ipcRenderer.send(this.channels.delete, {
            all: true,
            onlyNotComplete: true
          })
        }).catch(() => {})
      },
      clearAll () {
        ipcRenderer.send(this.channels.delete, {
          all: true,
          onlyComplete: true
        })
      },
      windCtrl(type){
        let win = remote.getCurrentWindow()
        switch (type) {
          case 'close':
            win.close()
            break
          case 'mini':
            win.minimize()
            break
          case 'maxi':
            if (win.isMaximized())
              win.unmaximize()
            else
              win.maximize()
            break
        }
      }
    }
  }
</script>
