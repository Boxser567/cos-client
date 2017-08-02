<template>

    <el-dialog title="跨域访问CORS添加规则" size="large"
               custom-class="dialog-bucket-cors-add"
               :visible.sync="isShow"
               :before-close="closeDialog">

        <el-form label-width="160px">
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
                <el-checkbox-group v-model="form.methods">
                    <el-checkbox label="PUT"></el-checkbox>
                    <el-checkbox label="GET"></el-checkbox>
                    <el-checkbox label="POST"></el-checkbox>
                    <el-checkbox label="DELETE"></el-checkbox>
                    <el-checkbox label="HEAD"></el-checkbox>
                </el-checkbox-group>
            </el-form-item>
            <el-form-item label="Allow-Headers">
                <el-input
                        type="textarea"
                        placeholder="支持多行输入"
                        :autosize="{ minRows: 2, maxRows: 2}"
                        resize="none"
                        v-model="form.allowHeaders">
                </el-input>
            </el-form-item>
            <el-form-item label="Expose-Headers">
                <el-input
                        type="textarea"
                        placeholder="支持多行输入"
                        :autosize="{ minRows: 2, maxRows: 2}"
                        resize="none"
                        v-model="form.exposeHeaders">
                </el-input>
            </el-form-item>
            <el-form-item label="超时 Max-Age">
                <el-input class="max-age" type="text" size="small" v-model="form.maxAge"></el-input>
                s
            </el-form-item>
        </el-form>

        <div slot="footer" class="dialog-footer">
            <el-button type="primary" size="small" @click="submit">提交</el-button>
            <el-button size="small" @click="closeDialog">关 闭</el-button>
        </div>
    </el-dialog>

</template>


<script>
  function getArray (text) {
    if (!text) return
    let arr = text.split('\n')
    arr.forEach((n, i) => {
      if (n === '') {
        arr.splice(i, 1)
      }
    })
    return arr
  }

  export default {

    props: ['isShow'],
    data () {
      return {
        form: {
          origin: null,
          methods: [],
          allowHeaders: null,
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
        this.form.origin = getArray(this.form.origin)
        this.form.allowHeaders = getArray(this.form.allowHeaders)
        this.form.exposeHeaders = getArray(this.form.exposeHeaders)
        console.log(this.form)

      },
      closeDialog(){
        this.$emit('update:isShow', false)
      }
    }

  }
</script>