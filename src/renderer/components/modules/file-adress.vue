<template>

    <div>
        <el-dialog title="获取Object地址"
                   custom-class="dialog-http"
                   :visible.sync="isShow"
                   :before-close="closeDialog"
                   size="small">
            <el-row>
                <el-col :span="8">文件名:</el-col>
                <el-col :span="16">aaaa.xml</el-col>
            </el-row>
            <el-row>
                <el-col :span="8">地址:</el-col>
                <el-col :span="16">
                    <p id="myEle">http://aa.com</p>
                    <el-button type="primary" size="small" @click="selectText()">复制</el-button>
                </el-col>
            </el-row>
            <div slot="footer" class="dialog-footer">
                <el-button type="primary" @click="closeDialog">确 定</el-button>
            </div>
        </el-dialog>
    </div>

</template>


<script>
  export default {

    props: ['isShow'],
    data () {
      return {}
    },
    created () {

    },
    computed: {},
    methods: {
      selectText () {

      },
      // url: 'http://' + param.Bucket + '-1253834952.' + param.Region + '.myqcloud.com/' + state.selectFile.Key
      closeDialog () {
        this.$emit('closeDialog')
      }
    }

  }
</script>