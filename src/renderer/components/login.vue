<template>
    <el-form class="login-form">
        <el-form-item>
            <el-input type="text" v-model="AppId" size="large" placeholder="App ID"></el-input>
        </el-form-item>
        <el-form-item>
            <el-input type="text" v-model="SecretId" size="large" placeholder="Access Key ID"></el-input>
        </el-form-item>
        <el-form-item>
            <el-input type="password" v-model="SecretKey" size="large" placeholder="Access Key Secret"></el-input>
        </el-form-item>
        <el-form-item>
            <el-input type="password" v-model="password1" placeholder="password1"></el-input>
        </el-form-item>
        <!--<el-form-item>-->
        <!--<el-input type="password" v-model="password2" placeholder="password2"></el-input>-->
        <!--</el-form-item>-->
        <el-form-item>
            <el-button @click="debug">debug</el-button>
            <el-button type="primary" @click="save">登录</el-button>
        </el-form-item>
    </el-form>
</template>

<script>
  import { ipcRenderer } from 'electron'
  export default {
    name: 'newPage',
    data () {
      return {
        AppId: '',
        SecretId: '',
        SecretKey: '',
        password1: '',
        password2: ''
      }
    },
    created () {},
    methods: {
      save () {
        this.$store.dispatch('setConfig', {
          cos: {
            AppId: this.AppId,
            SecretId: this.SecretId,
            SecretKey: this.SecretKey
          },
          password: this.password1
        })
        this.$store.dispatch('bucket/getService').then(() => {
          this.$router.replace('/')
        }, (err) => {
          ipcRenderer.send('ClearAll')
          this.$message(err.error.Message)
        })
      },
      debug () {
        this.AppId = '1253834952'
        this.SecretId = 'AKIDa4NkxzaV0Ut7Yr4sa6ScbNwMdibHb4A4'
        this.SecretKey = 'qUwCGAsRq46wZ1HLCrKbhfS8e0A8tUu8'
      }
    }
  }
</script>