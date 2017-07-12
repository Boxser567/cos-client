<template>
    <el-form class="login-form">
        <el-form-item>
            <el-input type="text" placeholder="Access Key ID"></el-input>
        </el-form-item>
        <el-form-item>
            <el-input type="password" placeholder="Access Key Secret"></el-input>
        </el-form-item>
        <el-form-item>
            <el-button type="primary" @click="login">登录</el-button>
        </el-form-item>
    </el-form>
</template>

<script>
  import { ipcRenderer } from 'electron'
  export default {
    name: 'loginPage',
    data () {
      return {}
    },
    created () {},
    methods: {
      login () {
        ipcRenderer.send('Login', {
          action: 'new',
          form: {
            SecretId: 'AKIDa4NkxzaV0Ut7Yr4sa6ScbNwMdibHb4A4',
            SecretKey: 'qUwCGAsRq46wZ1HLCrKbhfS8e0A8tUu8'
          }
        })
        ipcRenderer.once('Login-data', (event, arg) => {
          if (arg.error) {
            alert(arg.error.message)
            return
          }
          this.$router.replace('/')
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