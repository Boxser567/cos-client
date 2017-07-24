<template>
    <el-dialog title="设置" custom-class="dilog-setting" :visible.sync="dialogSettingVisible"
               :before-close="closeDialog">
        <div class="setting-form">

            <div class="upload">
                <h2>上传设置</h2>
                <el-row>
                    <el-col :span="9">同时任务数:</el-col>
                    <el-col :span="15">
                        <el-input-number v-model="upMax" size="small" :min="1" :max="10"></el-input-number>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="9">单任务线程数:</el-col>
                    <el-col :span="15">
                        <el-input-number size="small" v-model="upAsy" :min="1" :max="10"></el-input-number>
                    </el-col>
                </el-row>
            </div>

            <div class="download">
                <h2>下载设置</h2>
                <el-row>
                    <el-col :span="9">同时任务数:</el-col>
                    <el-col :span="15">
                        <el-input-number v-model="downMax" size="small" :min="1" :max="10"></el-input-number>
                    </el-col>
                </el-row>
                <!--<el-row>-->
                <!--<el-col :span="9">单任务线程数:</el-col>-->
                <!--<el-col :span="15">-->
                <!--<el-input-number size="small" v-model="num2" :min="1" :max="10"></el-input-number>-->
                <!--</el-col>-->
                <!--</el-row>-->
            </div>
        </div>
        <div slot="footer" class="dialog-footer">
            <el-button @click="closeDialog">取 消</el-button>
            <el-button type="primary" @click="submitForm()">确 定</el-button>
        </div>
    </el-dialog>
</template>

<script>
  export default{
    name: 'setting',
    props: ['dialogSettingVisible'],
    computed: {
      config () {
        return this.$store.state.config
      }
    },
    data () {
      return {
        upMax: 0,
        upAsy: 0,
        downMax: 0
      }
    },
    created () {
      this.fetchData()
    },
    methods: {
      fetchData () {
        this.upMax = this.config.upload.maxActivity
        this.upAsy = this.config.upload.asyncLim
        this.downMax = this.config.download.maxActivity
      },
      submitForm () {
        let parms = {
          upload: {
            maxActivity: this.upMax,
            asyncLim: this.upAsy
          },
          download: {
            maxActivity: this.downMax
          }
        }
        this.$store.dispatch('setConfig', parms)
        console.log(this.$store.state.config)
        this.closeDialog()
      },
      closeDialog () {
        this.$emit('closeDiolog')
      }
    }

  }
</script>