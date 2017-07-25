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

                <div class="bucket-group" v-for="(value,key) in bucketList" :class="{ active:false }">

                    <div class="bucket-item" @contextmenu="openMenu($event)">
                        <div class="item"
                             v-for="b in value"
                             @click="selectBucket(b)"
                             :key="b.Name"
                             :class="{ 'active':b.active }"
                             :bucketName="b.Name"
                             :bucketRegion="b.Location"
                             :createDate="b.CreateDate"
                             :title="b.Name"
                        >
                            <a>{{b.Name}} <i class="el-icon-arrow-down" @click="openMenu($event)"></i></a>
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
        <proto-manage :dialogManageVisible="dialogManageVisible" :currentBucket="rightChooseBucket"
                      @freshBucket="fetchData" @closeManage="dialogManageVisible=false"></proto-manage>
        <!--设置-->
        <setting :dialogSettingVisible="dialogSettingVisible" @closeDiolog="dialogSettingVisible = false"></setting>

    </div>
</template>

<script>
  import { mapState } from 'vuex'
  import setting from './modules/setting.vue'
  import addBucket from './modules/add-bucket.vue'
  import protoManage from './modules/property-manager.vue'

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
            {name: '基本信息', func: this.getProperty},
            {name: '跨域访问CORS设置', func: this.setCors},
            {name: '权限管理', func: this.setLimit}
          ]
        },
        rightChooseBucket: null,
        dialogAddVisible: false,
        dialogManageVisible: false,
        dialogSettingVisible: false
      }
    },

    components: {addBucket, protoManage, setting},

    computed: {
      ...mapState('bucket', ['bucketList', 'currentBucket']),
      getKey () {
        for (let key in this.bucketList) {
          return key
        }
      }
    },

    created () {},

    methods: {
      fetchData () {
        this.bloading = true
        this.$store.dispatch('bucket/getService').then(() => {
          this.bloading = false
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
        e.preventDefault()
        e.stopPropagation()
        let doms = e.target.parentNode
        if (e.target.tagName === 'I') {
          doms = doms.parentNode
        }
        this.rightChooseBucket = {
          Bucket: doms.getAttribute('bucketName'),
          Region: doms.getAttribute('bucketRegion'),
          createTime: doms.getAttribute('createDate')
        }
        this.bucketMenu.viewMenu = true
        this.$nextTick(() => {
          this.$refs.right.focus()
          this.setMenu(e.y, e.x)
        })
      },

      getProperty: function () {
        this.bucketMenu.viewMenu = false
        this.dialogManageVisible = true
      },

      setCors: function () {

      },

      setLimit: function () {

      }
    }
  }
</script>



