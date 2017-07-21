<template>
    <div>
        <el-dialog
                title="文件删除"
                :visible.sync="isShow"
                :close-on-click-modal="false"
                :close-on-press-escape="false"
                :show-close="false"
                custom-class="delete-error"
                size="large">
            <!--<span>这是一段信息 {{errorMsg}} </span>-->
            <div class="tl">
                删除进度: {{errorMsg ? errorMsg.data.done : '' }}/{{errorMsg ? errorMsg.data.total : '' }}
                {{errorMsg}}
            </div>
            <el-progress :percentage="getProgress"
                         :stroke-width="8"></el-progress>
            <div slot="footer" class="dialog-footer">
                <el-button @click="cancel" v-if="errorMsg? errorMsg.action==='finish'?false:true : true" type="danger">
                    取 消
                </el-button>
                <el-button @click="cancel" v-if="errorMsg? errorMsg.action==='finish'?true:false : false">关 闭
                </el-button>
            </div>
        </el-dialog>
    </div>

</template>


<script>
  import { mutations, mapState, actions } from 'vuex'

  export default {

    props: ['isShow', 'errorMsg'],
    data(){
      return {
        contentShow: false
      }
    },
    computed: {
      getProgress(){
        if (!this.errorMsg) return 0
        return Math.floor(this.errorMsg.data.done / this.errorMsg.data.total * 100)
      }
    },
    methods: {
      close(){
        this.$emit('update:isShow', false)
      },
      cancel(){
        this.$emit('update:isShow', false)
      },

    }

  }

</script>