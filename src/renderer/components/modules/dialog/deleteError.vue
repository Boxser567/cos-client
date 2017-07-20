<template>
    <div>
        <el-dialog
                title="提示"
                :visible.sync="isShow"
                :before-close="close"
                size="large">
            <span>这是一段信息 {{errorMsg}} </span>
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

    props: ['isShow', 'errorMsg'],
    data(){
      return {
        contentShow: false
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