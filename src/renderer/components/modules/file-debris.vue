<template>
    <div>
        <el-dialog title="跨域访问CORS设置"
                   custom-class="dialog-bucket-cors"
                   :visible.sync="isShow"
                   :before-close="closeDialog"
                   :lock-scroll="false"
                   size="small">
            <div>
                当前状态：
                <el-switch
                        v-model="isOpen"
                        on-color="#13ce66"
                        off-color="#ff4949"
                        on-value="100"
                        off-value="0">
                </el-switch>
                <div v-if="isOpen === '100' ? true : false ">
                    <p class="tl">配置详情
                        <el-button type="text" @click="addRule"><i class="el-icon-plus"></i> 新增规则</el-button>
                    </p>
                    <el-table :data="tableData" max-height="300" stripe style="width: 100%">
                        <el-table-column label="来源Origin" width="200">
                            <template scope="scope">
                                <p v-for="item in scope.row.AllowedOrigins">{{item}}</p>
                            </template>
                        </el-table-column>
                        <el-table-column label="操作 Methods" width="160">
                            <template scope="scope">
                                <p v-for="item in scope.row.AllowedMethods">{{item}}</p>
                            </template>
                        </el-table-column>
                        <el-table-column label="Allow-Headers" width="160">
                            <template scope="scope">
                                <p v-for="item in scope.row.AllowedHeaders">{{item}}</p>
                            </template>
                        </el-table-column>
                        <el-table-column label="Expose-Headers" width="160">
                            <template scope="scope">
                                <p v-for="item in scope.row.ExposeHeaders">{{item}}</p>
                            </template>
                        </el-table-column>
                        <el-table-column label="超时 Max-Age" width="160">
                            <template scope="scope">
                                <p>{{scope.row.MaxAgeSeconds}}</p>
                            </template>
                        </el-table-column>
                        <el-table-column label="操作" fixed="right" width="90">
                            <template scope="scope">
                                <div class="done">
                                    <el-button @click.native.prevent="handleRow(scope.$index)" type="text" size="small">
                                        修改
                                    </el-button>
                                    <el-button @click.native.prevent="deleteRow(scope.$index)" type="text" size="small">
                                        删除
                                    </el-button>
                                </div>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
            </div>
            <div slot="footer" class="dialog-footer">
                <a @click="openUrl" style="color: #1c8de0; font-size: 12px; float: left">CORS设置使用帮助</a>

                <el-button type="primary" size="small" @click="save">保 存</el-button>
                <el-button size="small" @click="closeDialog">关 闭</el-button>
            </div>
        </el-dialog>
        <my-handle :isShow.sync="isHandleColumn" :openMode="openMode" @submitForm="handleForm"></my-handle>
    </div>
</template>


<script>
  import { shell } from 'electron'
  import myHandle from './file-debris-handle.vue'
  export default {

    props: ['isShow', 'options'],

    data () {
      return {
        isOpen: '0',
        openMode: null,
        isHandleColumn: false,
        tableData: [] // AllowedHeaders  , AllowedMethods ,  AllowedOrigins  , ExposeHeaders  , MaxAgeSeconds
      }
    },
    watch: {
      'isShow': {
        handler: function (val) {
          if (val) this.renderData()
        }
      }

    },
    components: {myHandle},
    methods: {
      renderData () {
        if (!this.options) return
        this.$store.dispatch('bucket/getBucketCORS', this.options).then(res => {
          console.log(res)
          this.tableData = res.CORSRules
          if (res.CORSRules.length)
            this.isOpen = '100'
          else
            this.isOpen = '0'
        })
      },
      handleRow (index) {       //编辑
        this.openMode = {
          type: 'edit',
          index: index,
          data: [].concat(this.tableData[index])
        }
        this.isHandleColumn = true
      },
      addRule(){
        this.openMode = {
          type: 'add'
        }
        this.isHandleColumn = true
      },
      deleteRow (index) {
        this.tableData.splice(index, 1)
      },
      closeDialog () {
        this.isOpen = '0'
        this.openMode = null
        this.$emit('update:isShow', false)
      },
      openUrl () {
        shell.openExternal('https://www.qcloud.com/document/product/436/6251')
      },
      handleForm(obj){
        if (!obj) return
        if (obj.type === 'edit') {
          this.tableData.splice(obj.index, 1, obj.data)
        } else {
          this.tableData.push(obj.data)
        }
      },
      save () {
        let str = 'putBucketCORS'
        let parms = {
          Bucket: this.options.Bucket,
          Region: this.options.Region,
          CORSRules: this.tableData
        }
        if (this.isOpen === '0') { //关闭 cors
          delete parms.CORSRules
          str = 'deleteBucketCORS'
        }
        this.$store.dispatch(`bucket/${str}`, parms).then(res => {
          this.closeDialog()
        })

      }
    }

  }
</script>