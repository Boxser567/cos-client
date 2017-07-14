<template>
    <el-dialog title="添加bucket" custom-class="dilog-setting" :visible.sync="dialogSettingVisible"
               :before-close="closeDialog">
        <div class="setting-form">
            <!--<el-form-item label="Bucket名称">-->
                <!--<el-input v-model="myform.bucketName" placeholder="请输入Bucket名称"></el-input>-->
            <!--</el-form-item>-->
            <!--<el-form-item label="所属地域">-->
                <!--<el-select v-model="myform.areaDef" placeholder="请选择">-->
                    <!--<el-option-->
                            <!--v-for="item in myform.areaList"-->
                            <!--:key="item.value"-->
                            <!--:label="item.label"-->
                            <!--:value="item.value">-->
                    <!--</el-option>-->
                <!--</el-select>-->
            <!--</el-form-item>-->
            <!--<el-form-item label="访问权限">-->
                <!--<el-radio class="radio" v-model="myform.limit" label="public-read">公有读私有写</el-radio>-->
                <!--<el-radio class="radio" v-model="myform.limit" label="private">私有读写</el-radio>-->
            <!--</el-form-item>-->
            <!--<el-form-item label="CDN加速">-->
                <!--<el-radio class="radio" v-model="myform.cdnSpeed" label="open">开启</el-radio>-->
                <!--<el-radio class="radio" v-model="myform.cdnSpeed" label="close">关闭</el-radio>-->
            <!--</el-form-item>-->


            <h1>各种数据的设置</h1>

        </div>
        <div slot="footer" class="dialog-footer">
            <el-button @click="closeDialog">取 消</el-button>
            <el-button type="primary" @click="submitForm()">确 定</el-button>
        </div>
    </el-dialog>
</template>

<script>

  export default{
    name: 'setting',
    props: ['dialogSettingVisible'],
    data(){
      return {}
    },
    methods: {
      submitForm(){

      },
      closeDialog(){
        this.$emit('closeDiolog')
      }
    }

  }


</script>