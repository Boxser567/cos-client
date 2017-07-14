<template>
    <div class="listWrap">
        <VirtualList class="list"
                     :size="40"
                     :remain="4"
        >
            <!--<Item v-for="(item, $index) in uploadItem" :index="$index" :key="$index"></Item>-->
            <div class="progress-bar" :class="{ active:file.active }"
                 v-for="(file, $index) in uploadItem"
                 @click="selectLoadFile($event,'upload',file)" :index="$index" :key="file.id">
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
                        <span v-if="file.item.status=='wait'">等待中</span>
                        <span v-if="file.item.status=='pause'">暂停</span>
                        <span v-if="file.item.status=='complete'">完成</span>
                        <span v-if="file.item.status=='run'"> {{file.item.speed | bitSpeed}} </span>
                        <span v-if="file.item.status=='error'">出错</span>
                    </el-col>
                    <el-col :span="4">
                        <i class="el-icon-caret-right" v-if="file.item.status=='pause'"
                           @click="uploadFileCtrl($event,'begin',file.item.id)"></i>
                        <i v-if="file.status == 'run'" @click="uploadFileCtrl($event,'pause',file.item.id)"> || </i>
                        <i v-if="file.status=='error'" class="el-icon-warning"
                           @click="uploadFileCtrl($event,'begin',file.item.id)"></i>
                        <i class="el-icon-close" @click="uploadFileCtrl($event,'cancel',file.item.id)"></i>
                    </el-col>
                </el-row>
            </div>
        </VirtualList>
    </div>
</template>

</template>

<script>
  import { mapState } from 'vuex'

  export default {
    name: 'infinite-test',
    computed: {
      uploadProgress(){
        return this.$store.state.menulist.uploadProgress
      },
      uploadItem(){
        return this.$store.state.menulist.uploadItem
      }
    },
    data () {
      return {}
      itemHeight: 40
    },
    methods: {
      toBottom () {
        if (!this.uploadProgress.loading) {
          console.log('下', this.uploadItem, this.uploadProgress)
          this.$store.commit('menulist/uploadItemAdd')
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
      uploadFileCtrl(e, types, id) {
        e.preventDefault()
        this.$store.commit('menulist/uploadFileCtrl', {types: types, id: id})
      },
    }
  }
</script>


<style scoped>
    .counter {
        position: relative;
        padding-bottom: 20px;
    }

    .count {
        position: absolute;
        right: 0;
    }

    .listWrap {
        position: relative;
    }

    .list-loading {
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
    }

    .list {
        background: #fff;
        border-radius: 3px;
        -webkit-overflow-scrolling: touch;
        overflow-scrolling: touch;
    }

    .source {
        text-align: center;
        padding-top: 20px;
    }

    .source a {
        color: #999;
        text-decoration: none;
        font-weight: 100;
    }

    @media (max-width: 640px) {
        .times, .count {
            display: block;
        }

        .count {
            position: relative;
        }
    }
</style>

