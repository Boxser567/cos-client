<template>
    <el-form class="login-form">
        <el-form-item>
            <el-input type="password" v-model="password" placeholder="password"></el-input>
        </el-form-item>
        <el-form-item>
            <el-button type="primary" @click="login">登录</el-button>
        </el-form-item>
        <el-form-item>
            <el-button type="primary" @click="clear">清除</el-button>
        </el-form-item>
    </el-form>
</template>

<script>
  import { ipcRenderer } from 'electron'
  export default {
    name: 'loginPage',
    data () {
      return {
        password: ''
      }
    },
    created () {},
    methods: {
      login () {
        console.log(this.password)
        let err = ipcRenderer.sendSync('Login', {
          action: 'check',
          form: {
            password: this.password + ''
          }
        })
        if (err) {
          alert(err.message)
          return
        }
        // 检查Secret同时获取数据
        ipcRenderer.send('ListBucket')

        ipcRenderer.once('ListBucket-data', (event, arg) => {
          this.$router.replace('/')
        })
        ipcRenderer.once('ListBucket-error', (event, err) => {
          alert(err)
        })
      },
      clear () {
        ipcRenderer.sendSync('Login', {action: 'clear'})
        this.$router.replace('/new')
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