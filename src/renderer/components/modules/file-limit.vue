<template>

    <el-dialog title="权限设置"
               custom-class="dialog-file-limit"
               :visible.sync="isShow"
               :before-close="closeDialog"
               size="small">


        <el-tabs v-model="activeName" @tab-click="handleClick">
            <el-tab-pane label="公共权限" name="first">
                <el-table
                        :data="commonData"
                        border
                        style="width: 100%">
                    <el-table-column
                            label="用户组"
                            width="180">
                        <template scope="scope">
                            <span style="margin-left: 10px">{{ scope.row.user }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column
                            label="权限">
                        <template scope="scope">
                            <div v-if="scope.row.edit===1">
                                <el-radio class="radio" v-model="scope.row.pb_limit" label="public">公有读私有写
                                </el-radio>
                                <el-radio class="radio" v-model="scope.row.pb_limit" label="private">私有读写</el-radio>
                            </div>
                            <div v-if="scope.row.edit === 0">
                                <span v-if="scope.row.pb_limit==='public'">公有读私有写</span>
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
                <el-table
                        :data="userData"
                        border
                        style="width: 100%">
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
                                <el-button
                                        type="primary"
                                        size="small"
                                        @click="userLimit(scope.row,'save')">保存
                                </el-button>
                                <el-button
                                        size="small"
                                        @click="userLimit(scope.row,'cancel')">取消
                                </el-button>
                            </div>
                            <div v-if="scope.row.edit===0">
                                <el-button
                                        type="primary"
                                        size="small"
                                        @click="userLimit(scope.row,'edit')">编辑
                                </el-button>
                                <el-button
                                        size="small"
                                        @click="userLimit(scope.row,'delete')">删除
                                </el-button>
                            </div>

                            <!--新增的-->
                            <div v-if="scope.row.edit===3">
                                <el-button
                                        type="primary"
                                        size="small"
                                        @click="userLimit(scope.row,'add')">保存
                                </el-button>
                                <el-button
                                        size="small"
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
  export default {

    props: ['isShow', 'options'],

    data () {
      return {
        activeName: 'first',
        commonData: [{
          user: '所有人',
          pb_limit: 'private',
          old_limit: null,
          edit: 0
        }],
        userData: [],
        OwnerID: null
      }
    },

    created () {
//      this.renderData()
    },
    watch: {
      'isShow': {
        handler: function (val) {
          if (val)
            this.renderData()
        }
      }
    },
    computed: {},
    methods: {
      renderData(){
        this.userData=[]
        let parms = {
          Bucket: this.options.bucket.Bucket,
          Region: this.options.bucket.Region
        }

        this.$store.dispatch('bucket/getBucketACL', parms).then((resp) => {
          let OwnerID = resp.Owner.ID
          resp.Grants.forEach(n => {
            //Grantee  DisplayName
            if (n.Grantee.ID.indexOf('anyone') > -1) {

              this.commonData[0].pb_limit = 'public'

            } else {
              this.userData.push({
                user: n.Grantee.ID.replace(/\\/g, '/').replace(/.*\//, ''),
                checkLimit: n.Permission === 'FULL_CONTROL' ? ['读', '写'] : n.Permission === 'WRITE' ? ['写'] : ['读'],
                old_limit: null,
                old_user: null,
                edit: n.Grantee.ID === OwnerID ? 2 : 0
              })
            }
          })
        })
      },
      handleClick () {

      },
      commonLimit (row, status) {
        if (status === 'edit') {
          row.old_limit = row.pb_limit
          row.edit = 1
        }
        if (status === 'save') {
          row.edit = 0
        }
        if (status === 'cancel') {
          row.pb_limit = row.old_limit
          row.edit = 0
        }
      },
      userLimit (row, stadus) {
        switch (stadus) {
          case 'save':
            if (row.user === '') {
              this.$message('请输入添加的用户名!')
              return
            }
            row.edit = 0
            break
          case 'add':
            if (row.user === '') {
              this.$message('请输入添加的用户名!')
              return
            }
            row.edit = 0
            break
          case 'edit':
            row.old_user = row.user
            row.old_limit = row.checkLimit
            row.edit = 1
            break
          case 'delete':

            this.userData.splice(this.userData.length - 1, 1)
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
        this.$emit('update:isShow', false)
      }
    }

  }
</script>