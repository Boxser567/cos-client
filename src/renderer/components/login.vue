<template>
    <div class="locked-form">
        <el-form>
            <el-form-item>
                <el-input type="password" size="large" v-model="password" placeholder="password"></el-input>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="login">登录</el-button>
            </el-form-item>
            <el-form-item>
                <el-button  @click="clear">清除</el-button>
            </el-form-item>
        </el-form>
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
        this.$store.dispatch('bucket/getService').then((res) => {
          console.log(res)
          this.$router.replace('/')
//          this.$message('请正确填写登录信息！');
        })
      },
      clear () {
        ipcRenderer.sendSync('Login', {action: 'clear'})
        this.$router.replace('/locked')
      }
    }
  }
</script>
