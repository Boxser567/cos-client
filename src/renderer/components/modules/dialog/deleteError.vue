<template>
    <div>
        <el-dialog
                :visible.sync="isShow"
                :close-on-click-modal="false"
                :close-on-press-escape="false"
                :show-close="false"
                custom-class="delete-error"
                size="large">
            <span slot="title">{{ title }}</span>
            <!--<span>这是一段信息 {{errorMsg}} </span>-->
            <div class="tl">
                操作进度: {{errorMsg ? errorMsg.data.done : '' }}/{{errorMsg ? errorMsg.data.total : '' }}
            </div>
            <el-progress v-if="getProgress" :percentage="getProgress" :stroke-width="8"></el-progress>
            <div slot="footer" class="dialog-footer">
                <el-button @click="cancel" v-if="errorMsg? errorMsg.action==='finish'?false:true : true" type="danger">
                    取 消
                </el-button>
                <el-button @click="close" v-if="errorMsg? errorMsg.action==='finish'?true:false : false">关 闭
                </el-button>
            </div>
        </el-dialog>
    </div>

</template>


<script>
  export default {

    props: ['isShow', 'errorMsg'],
    data () {
      return {
        contentShow: false
      }
    },
    computed: {
      title () {
        return this.errorMsg ? this.errorMsg.type === 'delete' ? '文件删除' : '文件复制' : '文件'
      },
      getProgress () {
        if (!this.errorMsg) return 0
        return Math.floor((this.errorMsg.data.done / this.errorMsg.data.total) * 100)
      }
    },
    methods: {
      close () {
        this.$emit('update:isShow', false)
      },
      cancel () {
        this.errorMsg.cancel()
        this.$emit('update:isShow', false)
      }

    }

  }
</script>