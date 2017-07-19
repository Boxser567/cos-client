<template>
    <div class="index">
        <div class="slide-left">
            <div class="logo">Oss</div>
            <div class="bucket-opt">
                <ul>
                    <li><a @click="dialogAddVisible = true"><i class="el-icon-plus"></i>新建</a></li>
                    <li><a @click="dialogSettingVisible=true"><i class="el-icon-setting"></i>设置</a></li>
                    <li><a @click="fetchData"><i class="el-icon-star-on"></i>刷新</a></li>
                </ul>
            </div>
            <div class="bucket">

                <div class="bucket-group" v-for="(value,key) in bucketList" :class="{ active:false }">

                    <a class="bucket-tl"> <span>AppID：</span> {{ key }} </a>

                    <div class="bucket-item" @contextmenu="openMenu($event)">
                        <div class="item"
                             v-for="b in value"
                             @click="selectBucket(b)"
                             :key="b.Name"
                             :class="{ 'active':b.active }"
                             :bucketName="b.Name"
                             :bucketRegion="b.Location"
                        >
                            <a>{{b.Name}} <i class="el-icon-arrow-down"></i></a>
                        </div>
                    </div>
                </div>

            </div>


            <ul id="bucket-menu-list" tabindex="-1" ref="right" v-if="bucketMenu.viewMenu" @blur="closeMenu"
                :style="{ top:bucketMenu.top, left:bucketMenu.left }">
                <li v-for="i in bucketMenu.list" @click="i.func"> {{i.name}}</li>
            </ul>

        </div>

        <div>
            <router-view></router-view>
        </div>

        <add-bucket :dialogAddVisible="dialogAddVisible" @closeBucket="dialogAddVisible = false"
                    @freshBucket="fetchData"></add-bucket>

        <!--属性管理-->
        <proto-manage :dialogManageVisible="dialogManageVisible" :currentBucket="currentBucket"
                      @freshBucket="fetchData" @closeManage="dialogManageVisible=false"></proto-manage>
        <!--设置-->
        <setting :dialogSettingVisible="dialogSettingVisible" @closeDiolog="dialogSettingVisible = false"></setting>

    </div>
</template>

<script>
  import  { ipcRenderer } from  'electron'

  import { mutations, mapState } from 'vuex'
  import setting from  './modules/setting.vue'
  import addBucket from  './modules/add-bucket.vue'
  import protoManage from  './modules/property-manager.vue'

  export default {
    name: 'index-page',

    data () {
      return {
        bloading: true,
        bucketMenu: {
          viewMenu: false,
          top: '0px',
          left: '0px',
          list: [
            {name: '属性管理', func: this.getProperty},
            {name: '回调设置', func: this.getCallbackSet},
            {name: '碎片管理', func: this.getPieceManage},
            {name: 'Bucket下载', func: this.getTotalBucket}
          ]
        },
        dialogAddVisible: false,
        dialogManageVisible: false,
        dialogSettingVisible: false,
        rightChooseBucket: null
      }
    },

    components: {addBucket, protoManage, setting},

    computed: {
      ...mapState('bucket', ['bucketList', 'currentBucket'])
    },

    created(){
//      this.fetchData()
      this.fetchPost()
    },

    methods: {
      fetchData(){
        this.bloading = true
        this.$store.dispatch('bucket/getService').then(() => {
          this.bloading = false
        })
      },
      fetchPost(){
        ipcRenderer.send('GetUploadTasks')

        ipcRenderer.on('GetUploadTasks-data', (event, data) => {
          this.$store.commit('menulist/updataProgress', data)
        })

        ipcRenderer.send('GetDownloadTasks')
        ipcRenderer.on('GetDownloadTasks-data', (event, data) => {
          this.$store.commit('menulist/downloadProgress', data)
        })
      },
      selectBucket: function (b) {
        this.$store.commit('bucket/bucketActive', b.Name)
        this.$store.commit('menulist/unSelectFile')
        this.$router.push({
          path: '/file/' + b.Name,
          query: {
            bucket: b.Name,
            region: b.Location,
            folders: []
          }
        })
      },

      setMenu: function (top, left) {
        let largestHeight = window.innerHeight - this.$refs.right.offsetHeight - 25
        let largestWidth = window.innerWidth - this.$refs.right.offsetWidth - 25
        if (top > largestHeight) top = largestHeight
        if (left > largestWidth) left = largestWidth
        this.bucketMenu.top = top + 'px'
        this.bucketMenu.left = left + 'px'
      },

      closeMenu: function () {
        this.bucketMenu.viewMenu = false
      },

      openMenu: function (e) {
        let doms = e.target.parentNode
        if (e.target.tagName === 'I') {
          doms = doms.parentNode
        }
        this.$store.commit('bucket/currentBucket', {
          Bucket: doms.getAttribute('bucketName'),
          Region: doms.getAttribute('bucketRegion')
        })
        this.bucketMenu.viewMenu = true
        this.$nextTick(() => {
          this.$refs.right.focus()
          this.setMenu(e.y, e.x)
        })
        e.preventDefault()
      },

      getProperty: function () {
        this.bucketMenu.viewMenu = false
        this.dialogManageVisible = true
      },
      getCallbackSet: function () {
      },
      getPieceManage: function () {
      },
      getTotalBucket: function () {
        this.$confirm('确定要下载整个Bucket吗?', '请确认', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$message({
            type: 'success',
            message: '下载中，请稍后!'
          })
        }).catch(() => {})
      }
    }
  }
</script>



