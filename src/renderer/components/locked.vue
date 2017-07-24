<template>
    <div class="login-bg">
        <div class="locked-form">
            <el-form>
                <el-form-item>
                    <el-input type="password" size="large" v-model="password" placeholder="password"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="login">登录</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button @click="clear">清除</el-button>
                </el-form-item>
            </el-form>
        </div>
    </div>
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
//        if (this.password !== this.$store.state.config.password) {
//          this.$message('密码不正确')
//          return
//        }
        // 检查Secret同时获取数据

        this.$store.dispatch('bucket/getService').then((res) => {
          this.$router.replace('/')
        }, (err) => {
          console.error(err)
          this.$message('密钥失效或网络错误' + err.message)
        })
      },
      clear () {
        ipcRenderer.send('ClearAll')
        this.$router.replace('/login')
      }
    }
  }
</script>
