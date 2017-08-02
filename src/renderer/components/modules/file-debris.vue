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
                        on-value="1"
                        off-value="0">
                </el-switch>
                <p class="tl">配置详情</p>
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
                            <div  class="done">
                                <el-button @click.native.prevent="handleRow(scope.$index)" type="text" size="small">修改
                                </el-button>
                                <el-button @click.native.prevent="deleteRow(scope.$index)" type="text" size="small">删除
                                </el-button>
                            </div>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <!--<a @click="openUrl" style="color: #1c8de0; padding: 10px 0;display: inline-block">CORS设置使用帮助</a>-->
            <div slot="footer" class="dialog-footer">
                <el-button type="primary" size="small" @click="save">保 存</el-button>
                <el-button size="small" @click="closeDialog">关 闭</el-button>
            </div>
        </el-dialog>
        <my-handle :isShow.sync="isHandleColumn"></my-handle>
    </div>
</template>


<script>
  import { shell } from 'electron'
  import myHandle from './file-debris-handle.vue'
  export default {

    props: ['isShow', 'options'],

    data () {
      return {
        isOpen: 0,
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
        this.isOpen = 0
        if (!this.options) return
        this.$store.dispatch('bucket/getBucketCORS', this.options).then(res => {
          console.log(res)
          this.tableData = res.CORSRules
        })
      },
      handleRow (index) {
        console.log(333, index)
        this.isHandleColumn = true
      },
      deleteRow (index) {
        this.tableData.splice(index, 1)
      },
      closeDialog () {
        this.$emit('update:isShow', false)
      },
      openUrl () {
        shell.openExternal('https://www.qcloud.com/document/product/436/6251')
      },
      save () {

      }
    }

  }
</script>