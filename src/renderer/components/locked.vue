<template>
    <el-form class="login-form">
        <el-form-item>
            <el-input type="text" v-model="SecretId" size="large" placeholder="Access Key ID"></el-input>
        </el-form-item>
        <el-form-item>
            <el-input type="password" v-model="SecretKey"  size="large" placeholder="Access Key Secret"></el-input>
        </el-form-item>
        <el-form-item>
            <el-input type="password" v-model="password1" placeholder="password1"></el-input>
        </el-form-item>
        <!--<el-form-item>-->
            <!--<el-input type="password" v-model="password2" placeholder="password2"></el-input>-->
        <!--</el-form-item>-->
        <el-form-item>
            <el-button @click="debug">debug</el-button>  <el-button type="primary" @click="save">登录</el-button>
        </el-form-item>
    </el-form>
</template>

<script>
  import { ipcRenderer } from 'electron'
  export default {
    name: 'newPage',
    data () {
      return {
        SecretId: '',
        SecretKey: '',
        password1: '',
        password2: ''
      }
    },
    created () {},
    methods: {
      save () {
        ipcRenderer.sendSync('Login', {
          action: 'new',
          form: {
            SecretId: this.SecretId,
            SecretKey: this.SecretKey,
            password: this.password1
          }
        })
        // todo 检查Secret同时获取数据

        this.$store.dispatch('bucket/getService').then((res) => {
          console.log(res)
          this.$message('请正确填写登录信息！');
        })

//        ipcRenderer.send('ListBucket')
//
//        ipcRenderer.once('ListBucket-data', (event, arg) => {
//          console.log(arg)
//          this.$router.replace('/')
//        })
//        ipcRenderer.once('ListBucket-error', (event, err) => {
//
//          this.$message('请正确填写登录信息！');
//        })
      },
      debug () {
        this.SecretId = 'AKIDa4NkxzaV0Ut7Yr4sa6ScbNwMdibHb4A4'
        this.SecretKey = 'qUwCGAsRq46wZ1HLCrKbhfS8e0A8tUu8'
      }
    }
  }
</script>