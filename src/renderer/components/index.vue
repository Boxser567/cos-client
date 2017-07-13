<template>
    <div class="index">
        <div class="slide-left">
            <div class="logo">Oss</div>
            <div class="bucket-opt">
                <ul>
                    <li><a @click="dialogAddVisible=true"><i class="el-icon-plus"></i>新建</a></li>
                    <li><a><i class="el-icon-setting"></i>设置</a></li>
                    <li><a @click="fetchData"><i class="el-icon-star-on"></i>刷新</a></li>
                </ul>
            </div>
            <div class="bucket">
                <!--<div class="loading" v-if="bloading">-->
                <!--<i class="el-icon-loading"></i>-->
                <!--</div>-->
                <div class="bucket-group" v-for="(value,key) in bucketList" :class="{ active:false }">

                    <a class="bucket-tl"> <i class="el-icon-caret-bottom"></i> {{ key }} </a>

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

        <!--添加bucket-->
        <el-dialog title="添加bucket" custom-class="dilog-addbucket" :visible.sync="dialogAddVisible">
            <el-form :model="myform">
                <el-form-item label="Bucket名称">
                    <el-input v-model="myform.bucketName" placeholder="请输入Bucket名称"></el-input>
                </el-form-item>
                <el-form-item label="所属地域">
                    <el-select v-model="myform.areaDef" placeholder="请选择">
                        <el-option
                                v-for="item in myform.areaList"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="访问权限">
                    <el-radio class="radio" v-model="myform.limit" label="public-read">公有读私有写</el-radio>
                    <el-radio class="radio" v-model="myform.limit" label="private">私有读写</el-radio>
                </el-form-item>
                <el-form-item label="CDN加速">
                    <el-radio class="radio" v-model="myform.cdnSpeed" label="open">开启</el-radio>
                    <el-radio class="radio" v-model="myform.cdnSpeed" label="close">关闭</el-radio>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogAddVisible = false">取 消</el-button>
                <el-button type="primary" @click="submitForm()">确 定</el-button>
            </div>
        </el-dialog>

        <!--属性管理-->
        <el-dialog v-if="currentBucket" :title="currentBucket.Name" size="large" custom-class="dilog-propertybucket"
                   :visible.sync="dialogManageVisible">
            <el-row>
                <el-col :span="8">Bucket名称:</el-col>
                <el-col :span="16">{{currentBucket.Bucket}}</el-col>
            </el-row>
            <el-row>
                <el-col :span="8">所属地域:</el-col>
                <el-col :span="16">{{currentBucket.Region}}</el-col>
            </el-row>
            <el-row>
                <el-col :span="8">访问权限:</el-col>
                <el-col :span="16">
                    <el-radio class="radio" v-model="myform.limit" label="public-read">公有读私有写</el-radio>
                    <el-radio class="radio" v-model="myform.limit" label="private">私有读写</el-radio>
                </el-col>
            </el-row>

            <div slot="footer" class="dialog-footer">
                <el-button type="danger" @click="deleteBucket">删除 Bucket</el-button>
                <el-button type="primary" @click="dialogManageVisible = false">确 定</el-button>
                <el-button @click="dialogManageVisible = false">取 消</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
  import { mutations, mapState } from 'vuex'

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
        myform: {
          bucketName: '',
          limit: 'public-read',
          areaList: [
            {
              value: 'cn-south',
              label: '华南'
            }, {
              value: 'cn-north',
              label: '华北'
            }, {
              value: 'cn-east',
              label: '华东'
            }, {
              value: 'cn-southwest',
              label: '西南'
            }],
          areaDef: 'cn-south',
          cdnSpeed: 'close'
        },
        rightChooseBucket: null
      }
    },

    computed: mapState('bucket', {
      bucketList: 'bucketList',
      currentBucket: 'currentBucket'

    }),

    created () {
      this.fetchData()
    },

    methods: {
      fetchData () {
        this.bloading = true
        this.$store.dispatch('bucket/getService').then(() => { this.bloading = false })
      },
      selectBucket: function (b) {
        this.$store.commit('bucket/bucketActive', b)
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
      submitForm: function () { // 新建bucket
        if (this.myform.bucketName.length > 40) {
          this.$message.error('bucket不能超过40字符!')
          return
        }
        if (!(/^[a-z\d]+$/.test(this.myform.bucketName))) {
          this.$message.error('bucket格式有误!')
          return
        }
        let params = {
          Bucket: this.myform.bucketName,
          Region: this.myform.areaDef,
          ACL: this.myform.limit
        }
        this.$store.dispatch('bucket/putBucket', {pms: params}).then(() => {
          this.fetchData()
          this.dialogAddVisible = false
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

      deleteBucket: function () {
        this.$store.dispatch('bucket/deleteBucket').then(() => {
          this.fetchData()
          this.dialogManageVisible = false
        })
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

<style lang="scss">
    @import "../assets/style/globals.scss";
</style>

