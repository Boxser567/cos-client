<template>

    <el-dialog title="跨域访问CORS设置"
               custom-class="dialog-file-limit"
               :visible.sync="isShow"
               :before-close="closeDialog"
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
        </div>
        <a @click="openUrl" style="color: #1c8de0; padding: 10px 0;display: inline-block">CORS设置使用帮助</a>
        <div slot="footer" class="dialog-footer">
            <el-button type="primary" @click="save">保 存</el-button>
            <el-button @click="closeDialog">关 闭</el-button>
        </div>
    </el-dialog>

</template>


<script>
  import { shell } from 'electron'
  export default {

    props: ['isShow', 'options'],

    data(){
      return {
        isOpen: 0
      }
    },
    watch: {
      'isShow': {
        handler: function (val) {
          if (val)
            this.renderData()
        }
      }

    },
    methods: {
      renderData(){
        this.isOpen = 0
        if (!this.options) return
        this.$store.dispatch('bucket/getBucketCORS', this.options).then(res => {
          console.log(res)
        })
      },
      closeDialog(){
        this.$emit('update:isShow', false)
      },
      openUrl(){
        shell.openExternal('https://www.qcloud.com/document/product/436/6251')
      },
      save(){

      }
    }

  }

</script>