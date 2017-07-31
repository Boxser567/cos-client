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
            <el-col :span="8">创建时间:</el-col>
            <el-col :span="16">
                {{currentBucket.CreateDate | getDate }}
            </el-col>
        </el-row>

        <div slot="footer" class="dialog-footer">
            <el-button type="danger" @click="deleteBucket">删除 Bucket</el-button>
            <el-button @click="closeDialog">关 闭</el-button>
        </div>
    </el-dialog>

</template>


<script>
  export default{
    props: ['dialogManageVisible', 'currentBucket'],
    data () {
      return {}
    },
    watch: {
      'dialogManageVisible': function (val) {
        if (val) { this.list() }
      }
    },

    methods: {
      list () {
        if (!this.currentBucket) return
        this.$store.dispatch('bucket/getBucketACL', this.currentBucket).then(() => {})
      },

      closeDialog () {
        this.$emit('closeManage')
      },

      deleteBucket: function () {
        if (!this.currentBucket) return

        this.$confirm('确定要删除吗？删除后数据不可恢复', '提示').then(() => {
          this.$store.dispatch('bucket/deleteBucket', this.currentBucket).then(() => {
            this.$emit('freshBucket')
            this.closeDialog()
          })
        }).catch(() => {})

      }
    }

  }
</script>
