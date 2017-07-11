<template>
    <el-form class="login-form">
        <el-form-item>
            <el-input type="text" placeholder="Access Key ID"></el-input>
        </el-form-item>
        <el-form-item>
            <el-input type="password" placeholder="Access Key Secret"></el-input>
        </el-form-item>
        <el-form-item>
            <!--<el-button type="primary" @click="login">登录</el-button>-->
            <router-link :to="{ path: '/' }">User</router-link>
        </el-form-item>
    </el-form>
</template>

<style>
    .login-form {
        width: 320px;
        padding: 40px;
        position: absolute;
        top: 20%;
        left: 50%;
        margin-left: -200px;
    }

    button {
        width: 100%;
    }
</style>

<script>
  export default {
    name: 'loginPage',
    data(){
      return {
        thisKey: null
      }
    },
    methods: {
      login(){
        console.log(this.$router)
        this.$router.push({name: 'loginPage'})
      }
    }
  }


</script>