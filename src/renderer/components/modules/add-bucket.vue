<template>
    <el-dialog title="创建Bucket" custom-class="dilog-addbucket" :visible.sync="dialogAddVisible"
               :before-close="closeDialog">
        <el-form :model="myform">
            <el-form-item label="Bucket名称">
                <el-row>
                    <el-col :span="15">
                        <el-input v-model="myform.bucketName" placeholder="请输入Bucket名称"></el-input>
                    </el-col>
                    <el-col :span="5" style="text-align: left"> -{{appid}}</el-col>
                    <el-col :span="4">
                        <el-tooltip content="仅支持小写字母、数字的组合，不能超过40字符" placement="bottom">
                            <span class="el-icon-warning"></span>
                        </el-tooltip>
                    </el-col>
                </el-row>
            </el-form-item>
            <el-form-item label="所属地域">
                <el-row>
                    <el-col :span="15">
                        <el-select v-model="myform.areaDef" placeholder="请选择">
                            <el-option
                                    v-for="item in myform.areaList"
                                    :key="item.value"
                                    :label="item.label"
                                    :value="item.value">
                            </el-option>
                        </el-select>
                    </el-col>
                    <el-col :span="4">
                        <el-tooltip content="与相同地域其他腾讯云服务内网互通，创建后不可更改地域" placement="bottom">
                            <span class="el-icon-warning"></span>
                        </el-tooltip>
                    </el-col>
                </el-row>

            </el-form-item>
            <el-form-item label="访问权限">
                <el-radio class="radio" v-model="myform.limit" label="public-read">公有读私有写</el-radio>
                <el-radio class="radio" v-model="myform.limit" label="private">私有读写</el-radio>
            </el-form-item>
            <el-form-item label="请求域名">
                {{myform.bucketName ? myform.bucketName : "名称"}}-{{appid}}.{{myform.areaDef}}.myqcloud.com
            </el-form-item>

            <!--<el-form-item label="CDN加速">-->
            <!--<el-radio class="radio" v-model="myform.cdnSpeed" label="open">开启</el-radio>-->
            <!--<el-radio class="radio" v-model="myform.cdnSpeed" label="close">关闭</el-radio>-->
            <!--</el-form-item>-->
        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button @click="closeDialog">取 消</el-button>
            <el-button type="primary" @click="submitForm()">确 定</el-button>
        </div>
    </el-dialog>
</template>

<script>
  export default{
    name: 'add-bucket',
    props: ['dialogAddVisible'],
    data () {
      return {
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
        }
      }
    },
    computed: {
      appid () {
        return this.$store.state.config.cos.AppId
      },
      bucketList(){
        return this.$store.state.bucket.bucketList
      }
    },
    created () {},
    methods: {
      renderData () {
        this.myform.bucketName = ''
        this.myform.limit = 'public-read'
        this.myform.areaDef = 'cn-south'
      },
      submitForm () {
        console.log('bucketList', this.bucketList)
        let flag = false
        if (this.bucketList.length) {
          this.bucketList.forEach(n => {
            if (n.Name === this.myform.bucketName) {
              flag = true
            }
          })
        }
        if (flag) {
          this.$message.error('bucket名称重复!')
          return
        }
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
          this.renderData()
          this.$emit('freshBucket')
          this.closeDialog()
        })
      },
      closeDialog () {
        this.$emit('closeBucket')
      }
    }
  }
</script>