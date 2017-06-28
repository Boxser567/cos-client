<template>
    <div class="slide-right">
        <div class="head">
            <div class="top-row">
                <div class="history">
                    <i class="el-icon-arrow-left"></i>
                    <i class="el-icon-arrow-right"></i>
                </div>
                <div class="nav-bar">
                    <div class="nav">
                        <!--<el-breadcrumb separator="/">-->
                        <!--<el-breadcrumb-item v-for="(n,index) in navOptions" :to = "goFilePath(index)">-->
                        <!--{{ n.name }}-->
                        <!--</el-breadcrumb-item>-->
                        <!--</el-breadcrumb>-->
                        <ul>
                            <li v-for="(n,index) in navOptions" @click="goFilePath(index)">{{ n.name }}</li>
                        </ul>
                    </div>
                    <input type="text" v-model="keyWord">
                    <i class="el-icon-search" @click="searchFn"></i>
                </div>
            </div>
            <div class="bottom-row">
                <div class="file-opts">
                    <div class="el-button-group">
                        <el-upload
                                class="small-upload"
                                action="http://11231231-1253834952.cn-north.myqcloud.com"
                                :show-file-list="false"
                                :multiple="true"
                                :http-request="onProgress"
                        >
                            <el-button size="small" type="primary">点击上传</el-button>
                        </el-upload>

                        <el-button size="small" @click="newFolder = !newFolder">新建文件夹</el-button>
                    </div>

                    <div class="el-button-group">
                        <el-button size="small" :plain="true" :disabled="true">下载</el-button>
                        <el-button size="small" :plain="true" :disabled="true">复制</el-button>
                        <el-button size="small" :plain="true" :disabled="true">删除</el-button>
                    </div>
                    <div class="el-button-group">
                        <el-button size="small" :plain="true" :disabled="true">获取地址</el-button>
                    </div>
                    <div class="el-button-group">
                        <el-button size="small" :plain="true" :disabled="true">设置HTTP头</el-button>
                    </div>
                    <span class="area">{{ options.region | getArea}}</span>

                </div>
            </div>
        </div>

        <file-list :options="options" :newfo="newFolder"></file-list>

    </div>
</template>

<script>
  import filelist from './file-list.vue'
//  import common from '../../assets/js/common'

  export default {
    name: 'filepage',
    components: {'file-list': filelist},
    beforeRouteUpdate (to, from, next) {
      this.options.bucket = to.params.bucket || to.query.bucket
      this.options.region = to.params.region || to.query.region
      this.navOptions = [{name: this.options.bucket}]
      if (to.path !== from.path) {
        this.options.folders = []
      } else {
        this.options.folders = to.query.folders
        let navbar = to.query.folders
        if (navbar) {
          navbar = navbar.split('/')
          navbar.splice(navbar.length - 1, 1)
          navbar.forEach((n) => this.navOptions.push({name: n}))
        }
      }
      // console.log('router钩子', to.params, this.options)
      next()
    },

    data () {
      return {
        options: {
          bucket: null, // this.$route.params.bucket
          region: null,
          folders: null
        },
        navOptions: [],
        newFolder: false,
        keyWord: null
      }
    },
    methods: {
      goFilePath (index) {
        if (this.navOptions.length) {
          if (index === this.navOptions.length - 1) return
          let goFolder = ''
          if (index !== 0) {
            this.navOptions.forEach((nav, idx) => {
              if (idx <= index && nav.name !== this.options.bucket) { goFolder += nav.name + '/' }
            })
          }
          let topage = {
            path: '/file/' + this.options.bucket,
            query: {
              bucket: this.options.bucket,
              region: this.options.region,
              folders: goFolder
            }
          }
          this.$router.push(topage)
        }
      },
      searchFn () {
        // if (!this.keyWord) return
      },
      onProgress (filelist) {
        console.log(filelist)
//        let path = filelist.file.path
//        let fileName = filelist.file.name  // path.replace(/\\/g, '/').replace(/.*\//, '');
//        let parms = {
//          'Bucket': this.options.bucket,
//          'Region': this.options.region,
//          'Key': fileName,
//          'FilePath': path,
//                    onHashProgress: function (onHashProgress) {
//                       console.log('onHashProgress', onHashProgress);
//                    },
//          onProgress: function (onProgress) {
//            console.log('onProgress', onProgress)
//          }
//        }
//                common.sliceUploadFile(parms, function (back) {
//                    console.log('成功', back);
//                })
      }
    }
  }
</script>
