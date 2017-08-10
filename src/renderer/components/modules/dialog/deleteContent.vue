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
            <div class="file" v-if="errorContent">
                文件〖 {{ filename }} 〗操作异常
                <div>
                    {{errorCon}}
                </div>
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
  export default {

    props: ['isShow', 'errorContent'],
    data () {
      return {
        filename: null,
        errorCon: null
      }
    },
    watch: {
      'isShow': function (val) {
        if (val) { this.renderData() }
      }
    },
    created () {

    },
    computed: {},
    methods: {
      renderData () {
        this.filename = this.errorContent.error.params.Key
        this.errorCon = this.errorContent.error.error.Message
      },
      close () {
        this.$emit('update:isShow', false)
      },
      ignore () {
        this.errorContent.ignore()
        this.close()
      },
      stops () {
        this.errorContent.stop()
        this.close()
      },
      retry () {
        this.errorContent.retry()
        this.close()
      }
    }

  }
</script>