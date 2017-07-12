<template>
    <el-form class="login-form">
        <el-form-item>
            <el-input type="text" v-model="SecretId" placeholder="Access Key ID"></el-input>
        </el-form-item>
        <el-form-item>
            <el-input type="password" v-model="SecretKey" placeholder="Access Key Secret"></el-input>
        </el-form-item>
        <el-form-item>
            <el-input type="password" v-model="password1" placeholder="password1"></el-input>
        </el-form-item>
        <el-form-item>
            <el-input type="password" v-model="password2" placeholder="password2"></el-input>
        </el-form-item>
        <el-form-item>
            <el-button type="primary" @click="login">登录</el-button>
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
      login () {
        ipcRenderer.sendSync('Login', {
          action: 'new',
          form: {
            // AKIDa4NkxzaV0Ut7Yr4sa6ScbNwMdibHb4A4
            SecretId: this.SecretId,
            // qUwCGAsRq46wZ1HLCrKbhfS8e0A8tUu8
            SecretKey: this.SecretKey,
            password: this.password1
          }
        })
        // 检查Secret同时获取数据
        ipcRenderer.send('ListBucket')

        ipcRenderer.once('ListBucket-data', (event, arg) => {
          this.$router.replace('/')
        })
        ipcRenderer.once('ListBucket-error', (event, err) => {
          alert(err)
        })
      }
    }
  }
</script>

<style>
    .login-form {
        width: 320px;
        padding: 40px;
        position: absolute;
        top: 20%;
        left: 50%;
        margin-left: -200px;
    }

    .login-form button {
        width: 100%;
    }
</style>