<template>

    <div>
        <el-dialog title="获取Object地址"
                   custom-class="dialog-http"
                   :visible.sync="isShow"
                   :before-close="closeDialog"
                   size="small">

            <el-row>
                <el-col :span="5">文件名:</el-col>
                <el-col :span="19">{{selectFile[0] ? selectFile[0].Key : '' }}</el-col>
            </el-row>
            <el-row v-if="!isPublic">
                <el-col :span="5"> &nbsp;</el-col>
                <el-col :span="19">请输入链接的有效期：
                    <el-input class="seconds" v-model="seconds" @focus="elFocus($event)" size="small"></el-input>
                    秒
                    <el-button type="primary" size="small" @click="createSign">获取</el-button>
                </el-col>
            </el-row>
            <el-row v-if="isPublic">
                <el-col :span="5">地址:</el-col>
                <el-col :span="19">
                    <el-input class="adress" v-model="iptText" @focus="elFocus($event)" size="small"></el-input>
                    <el-button type="primary" size="small" @click="selectText()">复制</el-button>
                </el-col>
            </el-row>
            <div slot="footer" class="dialog-footer">
                <el-button @click="closeDialog">关 闭</el-button>
            </div>
        </el-dialog>
    </div>

</template>


<script>
  import { mapState } from 'vuex'
  import { clipboard } from 'electron'

  export default {
    props: ['isShow'],

    data () {
      return {
        isPublic: null,
        iptText: null,
        seconds: 3600
      }
    },
    created () { },
    watch: {
      'isShow': {
        handler: function (val) {
          if (val) { this.renderData() }
        }
      }
    },
    computed: {
      ...mapState('menulist', ['selectFile', 'options']),
      config () {
        return this.$store.state.config
      }
    },
    methods: {
      renderData () {
        if (!this.options.Bucket) return
        this.isPublic = null
        this.iptText = null
        this.seconds = 3600
        let params = {
          Bucket: this.options.Bucket,
          Region: this.options.Region,
          Key: this.selectFile[0].Key
        }

        this.$store.dispatch('callCosApi', {api: 'getObjectAcl', params}).then(res => {
          console.log('getObjectAcl', res)
          res.Grants.forEach(n => {
            if (n.Grantee.ID === 'qcs::cam::anyone:anyone') {
              this.isPublic = true
            }
          })
          if (this.isPublic) {
            this.iptText = `http://${params.Bucket}-${this.appid}.${params.Region}.myqcloud.com/${params.Key}`
          }
        })
      },
      createSign () {
        let reg = /^[0-9]*$/
        if (this.seconds === '' || !reg.test(this.seconds)) {
          this.$message('请正确输入有效时间')
          return
        }
        let pms = {
          method: 'get',
          SecretId: this.config.cos.SecretId,
          SecretKey: this.config.cos.SecretKey,
          pathname: '/' + (this.selectFile[0].Key + ''),
          expires: this.seconds
        }
        this.$store.dispatch('bucket/getAuth', pms).then(data => {
          data = encodeURIComponent(data)
          let auth = `http://${this.options.Bucket}-${this.config.cos.AppId}.${this.options.Region}.myqcloud.com/${this.selectFile[0].Key}`
          this.iptText = `${auth}?sign=${data}`
          this.isPublic = true
        })
      },
      elFocus (e) {
        e.target.select()
        console.log(e.target)
      },
      selectText () {
        if (this.iptText) {
          clipboard.writeText(this.iptText)
          this.$message('已复制到剪切板')
        }
      },
      // url: 'http://' + param.Bucket + '-1253834952.' + param.Region + '.myqcloud.com/' + state.selectFile.Key
      closeDialog () {
        this.$emit('closeDialog')
      }
    }

  }
</script>