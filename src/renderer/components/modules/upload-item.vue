<template>

    <virtual-scroller class="scroller progress-file" :items="uploadProgress.list" item-height="40" content-tag="div">
        <template scope="file">
            <div class="progress-bar" :key="file.item.id"  :class="{ active:file.item.active }"
                 @click="selectLoadFile($event,'upload',file.item)">
                <img :src="file.item.Key | getFileImg" alt="">
                <el-row>
                    <el-col :span="12">
                        <p class="tl">{{file.item.Key}}</p>
                        <el-progress :percentage="(file.item.loaded/file.size * 100) | getInteger"></el-progress>
                    </el-col>
                    <el-col :span="4">
                        {{file.item.size | bitSize}}
                    </el-col>
                    <el-col :span="4">
                        <span v-if="file.status=='wait'">等待中</span>
                        <span v-if="file.status=='pause'">暂停</span>
                        <span v-if="file.status=='complete'">完成</span>
                        <span v-if="file.status=='run'"> {{file.item.speed | bitSpeed}} </span>
                        <span v-if="file.status=='error'">出错</span>
                    </el-col>
                    <el-col :span="4">
                        <i class="el-icon-caret-right" v-if="file.item.status=='pause'"
                           @click="uploadFileCtrl('begin',file.item.id)"></i>
                        <i v-if="file.status == 'run'" @click="uploadFileCtrl('pause',file.item.id)"> || </i>
                        <i v-if="file.status=='error'" class="el-icon-warning"
                           @click="uploadFileCtrl('begin',file.item.id)"></i>
                        <i class="el-icon-close" @click="uploadFileCtrl('cancel',file.item.id)"></i>
                    </el-col>
                </el-row>
            </div>
        </template>
    </virtual-scroller>

</template>

<script>
  import { mapState } from 'vuex'

  export default {
    name: 'infinite-test',
    computed: {
      uploadProgress(){
        return this.$store.state.menulist.uploadProgress
      }
    },
    data () {
      return {
      }
    },
    methods: {
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
      },
      uploadFileCtrl(types, id) {
        this.$store.commit('menulist/uploadFileCtrl', {types: types, id: id})
      },
    }
  }
</script>


