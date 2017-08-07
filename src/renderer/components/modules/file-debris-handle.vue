<template>
    <el-dialog title="跨域访问CORS添加规则" size="large"
               custom-class="dialog-bucket-cors-add"
               :visible.sync="isShow"
               :before-close="closeDialog">
        <el-form label-width="180px">
            <el-form-item label="*  来源 AllowedOrigins">
                <el-input
                        type="textarea"
                        placeholder="支持多行输入"
                        :autosize="{ minRows: 2, maxRows: 2}"
                        resize="none"
                        v-model="form.AllowedOrigins">
                </el-input>
            </el-form-item>
            <el-form-item label="*  操作 AllowedMethods">
                <el-checkbox-group v-model="form.AllowedMethods">
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
                        v-model="form.AllowedHeaders">
                </el-input>
            </el-form-item>
            <el-form-item label="Expose-Headers">
                <el-input
                        type="textarea"
                        placeholder="支持多行输入"
                        :autosize="{ minRows: 2, maxRows: 2}"
                        resize="none"
                        v-model="form.ExposeHeaders">
                </el-input>
            </el-form-item>
            <el-form-item label="*  超时 Max-Age">
                <el-input class="max-age" type="text" size="small" v-model="form.MaxAgeSeconds"></el-input>
                s
            </el-form-item>
        </el-form>

        <div slot="footer" class="dialog-footer">
            <el-button type="primary" size="small" :disabled="disableBtn" @click="submit">提交</el-button>
            <el-button size="small" @click="closeDialog">关 闭</el-button>
        </div>
    </el-dialog>
</template>

<script>
  export default {
    props: ['isShow', 'openMode'],
    data () {
      return {
        form: {
          AllowedOrigins: null,
          AllowedMethods: [],
          AllowedHeaders: 'accept\ncontent-type\nAllowedOrigins\nauthorization',
          ExposeHeaders: null,
          MaxAgeSeconds: 5
        }
      }
    },
    watch: {
      'openMode': {
        handler: function (val) {
          if (val && val.type === 'edit') this.editRender()
        }
      }
    },
    computed: {
      disableBtn () {
        return !this.form.AllowedOrigins || !this.form.AllowedMethods.length || (this.form.MaxAgeSeconds === '')
      }
    },
    methods: {
      editRender () {
        if (this.openMode.type === 'edit') {
          let dataObj = this.openMode.data[0]
          let myObj = {}
          for (let key in dataObj) {
            if (['AllowedHeaders', 'AllowedOrigins', 'ExposeHeaders'].indexOf(key) > -1) {
              let j = [].concat(dataObj[key])
              myObj[key] = j.join('\n')
            } else {
              myObj[key] = dataObj[key]
            }
          }
          this.form = myObj
        }
      },

      submit () {
        let AllowedOrigins = str2arr(this.form.AllowedOrigins)
        let AllowedHeaders = str2arr(this.form.AllowedHeaders)
        let ExposeHeaders = str2arr(this.form.ExposeHeaders)
        let flag = null
        AllowedOrigins.forEach((n, i) => {
          if (!/^[*-\w\d]+(\.[-\w\d]+)+$/.test(n)) {
            this.$message(`来源Origin第${i}行 输入格式有误`)
            flag = true
          }
        })
        if (flag) return
        if (!this.form.MaxAgeSeconds > 0) {
          this.$message('max-age必须为非负整数')
          return false
        }
        let obj = {
          type: this.openMode.type,
          index: this.openMode.index,
          data: {
            AllowedOrigins: AllowedOrigins,
            AllowedMethods: this.form.AllowedMethods,
            AllowedHeaders: AllowedHeaders,
            ExposeHeaders: ExposeHeaders,
            MaxAgeSeconds: this.form.MaxAgeSeconds
          }
        }
        this.$emit('submitForm', obj)
        this.closeDialog()
      },

      closeDialog () {
        this.form = {
          AllowedOrigins: null,
          AllowedMethods: [],
          AllowedHeaders: 'accept\ncontent-type\nAllowedOrigins\nauthorization',
          ExposeHeaders: null,
          MaxAgeSeconds: 5
        }
        this.$emit('submitForm')
        this.$emit('update:isShow', false)
      }
    }
  }

  function str2arr (str) {
    if (!str) return []
    let arr = str.split('\n')
    return arr.filter(n => {
      if (n !== '') return n
    })
  }
</script>