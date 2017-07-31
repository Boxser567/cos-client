<template>
    <div class="index">
        <div class="slide-left">
            <div class="bucket-tl"><span>AppID：</span> {{getKey}}</div>

            <div class="bucket-opt">
                <ul>
                    <li><a @click="dialogAddVisible = true"><i class="el-icon-plus"></i>新建</a></li>
                    <li><a @click="dialogSettingVisible=true"><i class="el-icon-setting"></i>设置</a></li>
                    <li><a @click="fetchData"><i class="fresh"></i>刷新</a></li>
                </ul>
            </div>

            <div class="bucket">
                <div class="bucket-group" v-for="(value, key) in bucketList" :class="{ active:false }">
                    <div class="bucket-item">
                        <div class="item" v-for="b in value"
                             @click="selectBucket(b)"
                             @contextmenu="openMenu($event, b)"
                             :key="b.Name"
                             :class="{ 'active':b.active }"
                             :title="b.Name">
                            <a>{{b.Name}} <i class="el-icon-arrow-down" @click="openMenu($event, b)"></i></a>
                        </div>
                    </div>
                </div>
            </div>

            <div class="loading" v-if="bloading"><i class="el-icon-loading"></i></div>

            <div class="load-progress" @click="openProgressWindow"> 查看进程
                {{ run.upload || run.download ? 'run' : 'stop' }}
            </div>

        </div>

        <div>
            <router-view></router-view>
        </div>

        <add-bucket :dialogAddVisible="dialogAddVisible" @closeBucket="dialogAddVisible = false"
                    @freshBucket="fetchData"></add-bucket>

        <!--属性管理-->
        <proto-manage :dialogManageVisible="dialogManageVisible" :currentBucket="rightChooseBucket"
                      @freshBucket="fetchData" @closeManage="dialogManageVisible=false"></proto-manage>
        <!--设置-->
        <setting :dialogSettingVisible="dialogSettingVisible" @closeDiolog="dialogSettingVisible = false"></setting>

        <!--跨域访问CORS设置-->
        <file-debris :isShow.sync="dialogCrosVisible"></file-debris>

        <!--权限设置-->
        <file-limit :isShow.sync="dialogFileLimit"
                    :options="{type:'bucket', bucket:this.rightChooseBucket}"></file-limit>

    </div>
</template>

<script>
  import { mapState } from 'vuex'
  import setting from './modules/setting.vue'
  import addBucket from './modules/add-bucket.vue'
  import protoManage from './modules/property-manager.vue'
  import fileDebris from './modules/file-debris.vue'
  import fileLimit from './modules/file-limit.vue'
  import { ipcRenderer, remote } from 'electron'
  const {Menu, MenuItem} = remote

  const bucketMenu = new Menu()

  export default {
    name: 'index-page',
    data () {
      return {
        bloading: false,
        selectBT: null,
        rightChooseBucket: null,
        dialogAddVisible: false,
        dialogManageVisible: false,
        dialogSettingVisible: false,
        dialogCrosVisible: false,
        dialogFileLimit: false,
        run: {
          upload: false,
          download: false
        }
      }
    },

    components: {addBucket, protoManage, setting, fileDebris, fileLimit},

    computed: {
      ...mapState('bucket', ['bucketList', 'currentBucket']),
      getKey () {
        for (let key in this.bucketList) {
          return key
        }
      }
    },

    created () {
      ipcRenderer.send('GetUploadTasks')
      ipcRenderer.send('GetDownloadTasks')

      ipcRenderer.on('GetUploadTasks-data', (event, tasks) => {
        this.run.upload = tasks.some(t => t.status === 'run')
      })

      ipcRenderer.on('GetDownloadTasks-data', (event, tasks) => {
        this.run.download = tasks.some(t => t.status === 'run')
      })

      bucketMenu.append(new MenuItem({label: '基本信息', click: this.getProperty}))
      bucketMenu.append(new MenuItem({label: '跨域访问CORS设置', click: this.setCors}))
      bucketMenu.append(new MenuItem({label: '权限管理', click: this.setLimit}))
    },

    methods: {
      openProgressWindow () {
        const url = (process.env.NODE_ENV === 'development'
          ? `http://localhost:9080/#/progress` : `file://${__dirname}/index.html#/progress`)
        window.open(url, '_blank', 'title=918291,height=450, width=794,resizable=no')
      },

      fetchData () {
        this.bloading = true
        this.$store.dispatch('bucket/getService').then(() => {
          if (this.selectBT) this.$store.commit('bucket/bucketActive', this.selectBT)
          this.bloading = false
        })
      },

      selectBucket (b) {
        this.selectBT = b.Name
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

      openMenu (e, item) {
        e.preventDefault()
        e.stopPropagation()
        this.rightChooseBucket = {
          Bucket: item.Name,
          Region: item.Location,
          CreateDate: item.CreateDate
        }
        bucketMenu.popup(remote.getCurrentWindow(), {async: true})
      },

      getProperty () {
        this.dialogManageVisible = true
      },

      setCors () {
        this.dialogCrosVisible = true
      },

      setLimit () {
        this.dialogFileLimit = true
      }
    }
  }
</script>
