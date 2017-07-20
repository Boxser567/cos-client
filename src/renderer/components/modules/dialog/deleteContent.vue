<template>
    <div>
        <el-dialog
                title="错误内容提示"
                :visible.sync="isShow"
                :before-close="close"
                size="tiny">
            <!--<div slot="footer" class="dialog-footer">-->
            <!--<el-button @click="dialogVisible = false">取 消</el-button>-->
            <!--<el-button type="primary" @click="dialogVisible = false">确 定</el-button>-->
            <!--</div>-->
        </el-dialog>
    </div>

</template>


<script>
  import { mutations, mapState, actions } from 'vuex'

  export default {

    props: ['isShow', 'errorContent'],
    data(){
      return {
      }
    },
    created(){

    },
    computed: {},
    methods: {
      close(){
        this.$emit('update:isShow', false)
      }
    }

  }

</script>