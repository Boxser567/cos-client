<template>
    <div class="login-bg">
        <button class="btn-debug" @click="debug">debug</button>
        <div class="line"></div>
        <el-form class="login-form">
            <img src="../../../static/images/logo.png" alt="">
            <div class="tl">COS控制台</div>
            <el-form-item>
                <el-input type="text" v-model="AppId" size="large" placeholder="App ID"></el-input>
            </el-form-item>
            <el-form-item>
                <el-input type="text" v-model="SecretId" size="large" placeholder="Access Key ID"></el-input>
            </el-form-item>
            <el-form-item>
                <el-input type="text" v-model="SecretKey" size="large" placeholder="Access Key Secret"></el-input>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="save">登 录</el-button>
            </el-form-item>
        </el-form>
    </div>
</template>

<script>
  import { remote } from 'electron'
  export default {
    name: 'newPage',
    data () {
      return {
        AppId: '',
        SecretId: '',
        SecretKey: ''
      }
    },
    created () {
      document.getElementsByTagName('title')[0].innerHTML = 'COS'
    },
    methods: {
      save () {
        this.$store.dispatch('setConfig', {
          cos: {
            AppId: this.AppId,
            SecretId: this.SecretId,
            SecretKey: this.SecretKey
          }
        })
        this.$store.dispatch('bucket/getService').then(() => {
          this.$router.replace('/index')
        })
      },
      debug () {
        this.AppId = '1253834952'
        this.SecretId = 'AKIDa4NkxzaV0Ut7Yr4sa6ScbNwMdibHb4A4'
        this.SecretKey = 'qUwCGAsRq46wZ1HLCrKbhfS8e0A8tUu8'
        remote.getCurrentWindow().openDevTools()
      }
    }
  }
</script>
