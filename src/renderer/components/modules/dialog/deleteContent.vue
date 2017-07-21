<template>
    <div>
        <el-dialog
                title="错误提示"
                :visible.sync="isShow"
                :before-close="close"
                :close-on-click-modal="false"
                :close-on-press-escape="false"
                :show-close="false"
                custom-class="delete-content"
                size="tiny">
            <div class="file">
                文件〖 xxxx.zip 〗删除异常
                {{errorContent }}
            </div>


            <div slot="footer" class="dialog-footer">
                <el-button type="primary" @click="stops">终止后续删除</el-button>
                <el-button type="primary" @click="retry">重试</el-button>
                <el-button @click="ignore">忽略</el-button>
            </div>
        </el-dialog>
    </div>

</template>


<script>
  import { mutations, mapState, actions } from 'vuex'

  export default {

    props: ['isShow', 'errorContent'],
    data(){
      return {}
    },
    created(){

    },
    computed: {},
    methods: {
      close(){
        this.$emit('update:isShow', false)
      },
      ignore(){
        this.errorContent.ignore()
        this.$emit('update:isShow', false)
      },
      stops(){
        this.errorContent.stop()
        this.$emit('update:isShow', false)
      },
      retry(){
        this.errorContent.retry()
        this.$emit('update:isShow', false)
      }
    }

  }

</script>