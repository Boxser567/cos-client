<template>

    <el-dialog title="跨域访问CORS添加规则" size="large" :visible.sync="isShow" :before-close="closeDialog">

        <el-form label-width="120px" >
            <el-form-item label="来源 Origin">
                <el-input
                        type="textarea"
                        placeholder="支持多行输入"
                        :autosize="{ minRows: 2, maxRows: 2}"
                        resize="none"
                        v-model="form.origin">
                </el-input>
            </el-form-item>
            <el-form-item label="操作 Methods">
                <el-input
                        type="textarea"
                        placeholder="支持多行输入"
                        :autosize="{ minRows: 2, maxRows: 2}"
                        resize="none"
                        v-model="form.origin">
                </el-input>
            </el-form-item>
        </el-form>

        <div slot="footer" class="dialog-footer">
            <el-button type="primary" @click="submit">提交</el-button>
            <el-button @click="closeDialog">关 闭</el-button>
        </div>
    </el-dialog>

</template>


<script>
  export default {

    props: ['isShow'],
    data () {
      return {
        form: {
          origin: null,
          methods: null,
          allowHeaders: [],
          exposeHeaders: null,
          maxAge: 5
        }
      }
    },
    created () {

    },
    computed: {},
    methods: {
      submit(){
        let text =this.form.origin
        text = text.split('\n')
        console.log(text)

      },
      closeDialog(){
        this.$emit('update:isShow', false)
      }
    }

  }
</script>