<template>

    <el-dialog v-if="currentBucket" :title="currentBucket.Name" size="large" custom-class="dilog-propertybucket"
               :visible.sync="dialogManageVisible" :before-close="closeDialog">
        <el-row>
            <el-col :span="8">Bucket名称:</el-col>
            <el-col :span="16">{{currentBucket.Bucket}}</el-col>
        </el-row>
        <el-row>
            <el-col :span="8">所属地域:</el-col>
            <el-col :span="16">{{currentBucket.Region}}</el-col>
        </el-row>
        <el-row>
            <el-col :span="8">访问权限:</el-col>
            <el-col :span="16">
                <el-radio class="radio" v-model="limit" label="public-read">公有读私有写</el-radio>
                <el-radio class="radio" v-model="limit" label="private">私有读写</el-radio>
            </el-col>
        </el-row>

        <div slot="footer" class="dialog-footer">
            <el-button type="danger" @click="deleteBucket">删除 Bucket</el-button>
            <el-button type="primary" @click="submitForm">确 定</el-button>
            <el-button @click="closeDialog">取 消</el-button>
        </div>
    </el-dialog>

</template>


<script>
  export default{
    props: ['dialogManageVisible', 'currentBucket'],
    data(){
      return {
        limit: 'public-read'
      }
    },
    created(){
      this.list()
    },

    methods: {
      list(){
        console.log(this.currentBucket, 'currentBucket')
      },
      closeDialog(){
        this.$emit('closeManage')
      },
      submitForm(){

      },
      deleteBucket: function () {
        this.$store.dispatch('bucket/deleteBucket').then(() => {
          this.$emit('freshBucket')
          this.$emit('closeManage')
        })
      },
    }

  }
</script>
