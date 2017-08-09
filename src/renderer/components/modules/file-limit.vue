<template>

    <el-dialog title="设置权限"
               custom-class="dialog-file-limit"
               :visible.sync="isShow"
               :before-close="closeDialog"
               size="small">


        <el-tabs v-model="activeName" @tab-click="handleClick">
            <el-tab-pane label="公共权限" name="first">
                <el-table
                        :data="commonData"
                        border>
                    <el-table-column
                            label="用户组"
                            width="180">
                        <template scope="scope">
                            <span style="margin-left: 10px">{{ scope.row.user }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column
                            width="299"
                            label="权限">
                        <template scope="scope">
                            <div v-if="scope.row.edit===1">
                                <el-radio class="radio" v-model="scope.row.pb_limit" label="public-read">公有读私有写
                                </el-radio>
                                <el-radio class="radio" v-model="scope.row.pb_limit" label="private">私有读写</el-radio>
                            </div>
                            <div v-if="scope.row.edit === 0">
                                <span v-if="scope.row.pb_limit==='public-read'">公有读私有写</span>
                                <span v-if="scope.row.pb_limit==='private'">私有读写</span>
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" width="180">
                        <template scope="scope">
                            <div v-if="scope.row.edit===0">
                                <el-button
                                        type="primary"
                                        size="small"
                                        @click="commonLimit(scope.row,'edit')">编辑
                                </el-button>
                            </div>

                            <div v-if="scope.row.edit===1">
                                <el-button
                                        type="primary"
                                        size="small"
                                        @click="commonLimit(scope.row,'save')">保存
                                </el-button>
                                <el-button
                                        size="small"
                                        @click="commonLimit(scope.row,'cancel')">取消
                                </el-button>
                            </div>
                        </template>
                    </el-table-column>
                </el-table>

            </el-tab-pane>

            <el-tab-pane label="用户权限" name="second">
                <el-table :data="userData" border style="width: 100%; display: block;">
                    <el-table-column
                            label="用户"
                            width="180">
                        <template scope="scope">
                            <span v-if="scope.row.edit===0 || scope.row.edit===2">{{ scope.row.user }}</span>
                            <el-input size="small" v-if="scope.row.edit===1 || scope.row.edit===3"
                                      v-model=" scope.row.user "></el-input>
                        </template>
                    </el-table-column>
                    <el-table-column
                            width="299"
                            label="权限">
                        <template scope="scope">
                            <div v-if="scope.row.edit===0 || scope.row.edit===2"> {{getLimit(scope.row)}}</div>
                            <div v-if="scope.row.edit===1 || scope.row.edit===3">
                                <el-checkbox-group v-model="scope.row.checkLimit">
                                    <el-checkbox label="读"></el-checkbox>
                                    <el-checkbox label="写"></el-checkbox>
                                </el-checkbox-group>
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" width="180">
                        <template scope="scope">
                            <div v-if="scope.row.edit===2"> --</div>
                            <div v-if="scope.row.edit===1">
                                <el-button type="primary" size="small" @click="userLimit(scope.row,'save')">保存
                                </el-button>
                                <el-button size="small" @click="userLimit(scope.row,'cancel')">取消</el-button>
                            </div>
                            <div v-if="scope.row.edit===0">
                                <el-button type="primary" size="small" @click="userLimit(scope.row,'edit')">编辑
                                </el-button>
                                <el-button size="small"
                                           @click="userLimit(scope.row,'delete')">删除
                                </el-button>
                            </div>

                            <!--新增的-->
                            <div v-if="scope.row.edit===3">
                                <el-button type="primary" size="small"
                                           @click="userLimit(scope.row,'add')">保存
                                </el-button>
                                <el-button size="small"
                                           @click="userLimit(scope.$index,'delRow')">删除
                                </el-button>
                            </div>
                        </template>
                    </el-table-column>
                </el-table>
                <el-button type="text" @click="addUers">添加用户</el-button>
            </el-tab-pane>
        </el-tabs>


        <div slot="footer" class="dialog-footer">
            <el-button type="primary" @click="closeDialog">关 闭</el-button>
        </div>
    </el-dialog>

</template>


<script>
  import { mapState } from 'vuex'

  export default {

    props: ['isShow', 'options'],

    data () {
      return {
        activeName: 'first',
        commonData: [{
          user: '所有人',
          pb_limit: 'private',
          old_limit: null,
          edit: 0 // 0初始化  1编辑  2为==OwnerID   3添加用户
        }],
        userData: [],
        Owner: null,
        parameters: null
      }
    },
    watch: {
      'isShow': {
        handler: function (val) {
          if (val) { this.renderData() }
        }
      }
    },
    computed: {
      ...mapState('menulist', ['selectFile'])
    },
    methods: {
      renderData () {
        this.parameters = {
          Bucket: this.options.Bucket || this.options.bucket.Bucket,
          Region: this.options.Region || this.options.bucket.Region
        }
        if (!this.parameters.Bucket || !this.parameters.Region) return
        let parms = this.parameters
        let str = 'getBucketACL'
        if (this.options.type === 'files') {
          str = 'getObjectACL'
          parms.Key = this.selectFile[0].Key
        }

        this.$store.dispatch(`bucket/${str}`, parms).then((resp) => {
          console.log(parms, '请求参数和返回', resp)
          this.Owner = resp.Owner
          resp.Grants.forEach(n => {
            if (n.Grantee.ID === 'qcs::cam::anyone:anyone') {
              this.commonData[0].pb_limit = 'public-read'
            } else {
              this.userData.push({
                ID: n.Grantee.ID,
                user: n.Grantee.ID.replace(/\\/g, '/').replace(/.*\//, ''),
                checkLimit: n.Permission === 'FULL_CONTROL' ? ['读', '写'] : n.Permission === 'WRITE' ? ['写'] : ['读'],
                old_limit: null,
                old_user: null,
                edit: n.Grantee.ID === this.Owner.ID ? 2 : 0
              })
            }
          })
        })
      },
      handleClick () {

      },
      commonLimit (row, status) { // 公共权限修改和保存
        if (status === 'edit') {
          row.old_limit = row.pb_limit
          row.edit = 1
        }
        if (status === 'save') {
          this.submitForm()
        }
        if (status === 'cancel') {
          row.pb_limit = row.old_limit
          row.edit = 0
        }
      },

      userLimit (row, stadus) {
        let _self = this

        let flag = {
          err: false,
          msg: null
        }

        function checkName () {
          let name = row.user
          if (name === '') {
            flag.err = true
            flag.msg = '请输入添加的用户名!'
            return
          }

          if (name.indexOf('/') > -1) {
            console.log('主帐号/子账号')
            let arr = name.split('/')
            if (arr.length !== 2) {
              flag.err = true
              flag.msg = '帐号格式填写不正确!'
              return

            } else {
              //_self.$message('主帐号与协作者帐号不对应!')
            }
          } else {
            let reg = /^[1-9][0-9]{4,12}$/gim
            if (!reg.test(name)) {
              flag.err = true
              flag.msg = '帐号格式填写不正确!'
              return
            }
          }
          if (row.checkLimit.length === 0) {
            flag.err = true
            flag.msg = '请至少选择一个用户权限!'
            return
          }
        }

        switch (stadus) {
          case 'save':
            checkName()
            if (flag.err) {
              this.$message.error(flag.msg)
              return
            }
            row.edit = 0
            this.submitForm()
            break
          case 'add':
            checkName()
            if (flag.err) {
              this.$message.error(flag.msg)
              return
            }
            row.edit = 0
            this.submitForm()
            break
          case 'edit':
            row.old_user = row.user
            row.old_limit = row.checkLimit
            row.edit = 1
            break
          case 'delete':
            // 删除
            let index = null
            this.userData.forEach((n, i) => {
              if (n.user === row.user) { index = i }
            })
            this.userData.splice(index, 1)
            this.submitForm()
            break
          case 'cancel':
            row.user = row.old_user
            row.checkLimit = row.old_limit
            row.edit = 0
            break
          case 'delRow':
            this.userData.splice(this.userData.length - 1, 1)
            break
          default :
            break
        }
      },
      submitForm () {
        let parms = Object.assign(this.parameters, {ACL: this.commonData[0].pb_limit})
        let grants = []
        let flag = false
        this.userData.forEach(n => {
          let checkID = `qcs::cam::uin/${n.user}:uin/${n.user}`
          if (checkID !== this.Owner.ID) {
            grants.push({
              Grantee: {
                DisplayName: `qcs::cam::uin/${n.user}:uin/${n.user}`,
                ID: `qcs::cam::uin/${n.user}:uin/${n.user}`
              },
              Permission: n.checkLimit.toString() === ['读', '写'].toString() ? 'FULL_CONTROL' : n.checkLimit.toString() === ['读'].toString() ? 'READ' : 'WRITE'
            })
          }
          if (n.edit === 1 || n.edit === 3) {
            flag = true
          }
        })
        if (flag) {
          this.$message('请先将用户权限表单填写完整!')
          return
        }
        if (grants.length > 0)
          parms.AccessControlPolicy = {
            Grants: grants,
            Owner: this.Owner
          }

        let str = 'putBucketACL'
        if (this.options.type === 'files') {
          str = 'putObjectACL'
          parms.Key = this.selectFile[0].Key
        }

        this.$store.dispatch(`bucket/${str}`, parms).then((resp) => {
          console.log('添加的参数', parms, resp)
          this.commonData[0].edit = 0
        })
      },
      addUers () {
        let last = this.userData[this.userData.length - 1]
        if ((!last.user) || last.edit === 3) {
          this.$message('请先提交正在新增的用户!')
          return
        }
        this.userData.push({
          user: '',
          checkLimit: ['读'],
          old_limit: null,
          edit: 3
        })
      },
      getLimit (row) {
        if (row.checkLimit.length > 1) {
          return row.checkLimit[0] + '、' + row.checkLimit[1]
        } else {
          return row.checkLimit[0]
        }
      },
      closeDialog () {
        this.userData = []
        this.activeName = 'first'
        this.commonData[0].pb_limit = 'private'
        this.Owner = null
        this.$emit('update:isShow', false)
      }
    }

  }
</script>