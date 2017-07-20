<template>
    <div>
        <el-dialog
                title="文件删除"
                :visible.sync="isShow"
                :before-close="close"
                :close-on-click-modal="false"
                :close-on-press-escape="false"
                :show-close="false"
                custom-class="delete-error"
                size="large">
            <!--<span>这是一段信息 {{errorMsg}} </span>-->
            <div class="tl">
                删除进度: {{errorMsg ? errorMsg.data.done : '' }}/{{errorMsg ? errorMsg.data.total : ''  }}
            </div>
            <el-progress :percentage="100" :stroke-width="8"></el-progress>
            <div slot="footer" class="dialog-footer">
                <el-button @click="cancel" type="primary">取 消</el-button>
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
    computed: {},
    methods: {
      close(){
        this.$emit('update:isShow', false)
      },
      cancel(){
        this.$emit('update:isShow', false)
      }
    }

  }

</script>