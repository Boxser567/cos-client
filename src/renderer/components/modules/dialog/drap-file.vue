<template>

    <div>
        <el-dialog title="上传文件" custom-class="dialog-upload" :visible.sync="isShow"
                   :before-close="closeDialog"
                   size="small">
            <div v-if="uploadlist.length === 0" class="drop-content" :class="{ 'active':dropActive }"
                 @dragover.prevent="dropActive = true"
                 @drop.prevent="onDrop"
                 @dragleave.prevent="dropActive = false">
                <i class="el-icon-upload"></i>
                <p>将文件拖到此处</p>
            </div>
            <div v-if="hoverActive" class="hoverActive"
                 @drop.prevent="onDrop"
                 @dragleave.prevent="hoverActive = false">
                <div>
                    <i class="el-icon-upload"></i>
                    <p>将文件拖到此处</p>
                </div>
            </div>

            <div v-if="uploadlist.length > 0" class="draglist" @dragover.prevent="hoverActive = true">
                <virtual-scroller v-if="uploadlist && uploadlist.length"
                                  :items="uploadlist" item-height="32" content-tag="div">
                    <template scope="props">
                        <div class="list"
                             @click="itemSelect(props.itemIndex)"
                             :key="props.item.lastModified">
                            <el-checkbox v-model="props.item.isCheck"></el-checkbox>
                            <div class="name">
                                <img :src="props.item | getFileImg" alt="">
                                <p>{{ props.item.name }}</p>
                            </div>
                        </div>
                    </template>
                </virtual-scroller>

            </div>
            <div slot="footer" class="dialog-footer">
                <el-button type="primary" size="small" @click="upload">确认上传</el-button>
                <el-button size="small" @click="closeDialog">关闭</el-button>
            </div>

        </el-dialog>
    </div>

</template>


<script>
  import { ipcRenderer } from 'electron'
  import fs from 'fs'
  export default {

    props: ['isShow'],
    data () {
      return {
        dropActive: false,
        hoverActive: false,
        uploadlist: []
      }
    },
    created () {

    },
    computed: {},
    methods: {
      onDrop (e) {
        this.dropActive = false
        this.hoverActive = false
        let files = e.dataTransfer.files
        if (files.length === 0) return
        files = Array.from(files)
        files.forEach(n => {
          fs.stat(n.path, (err, stat) => {
            if (err === null) {
              if (stat.isDirectory()) n.dir = true
              if (stat.isFile()) n.dir = false
            }
          })
          n.isCheck = true
          this.uploadlist.push(n)
        })
        setTimeout(y => this.uploadlist.push(), 200)
      },
      itemSelect(index){
        if (index !== undefined && this.uploadlist[index]) {
          this.uploadlist[index].isCheck = !this.uploadlist[index].isCheck
          this.uploadlist.push()
        }
      },
      upload(){
        let list = []
        this.uploadlist.forEach(x => {
          if (x.isCheck)
            list.push(x.path)
        })
        this.$store.dispatch('menulist/uploadFileByDrag', list)
        this.closeDialog()
      },
      closeDialog () {
        this.$emit('update:isShow', false)
        this.uploadlist.length = 0
      }
    }

  }
</script>