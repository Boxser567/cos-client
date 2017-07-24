<template>
    <div class="login-bg" >
<button @click="debug">debug</button>
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
                <el-checkbox >本机是cos云主机</el-checkbox>

                <el-select  popper-class="login-select-area" v-model="areaDef" placeholder="请选择">
                    <el-option
                            v-for="item in areaList"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value">
                    </el-option>
                </el-select>
                <!--<el-input type="password" v-model="password1" placeholder="password1"></el-input>-->
            </el-form-item>
            <!--<el-form-item>-->
            <!--<el-input type="password" v-model="password2" placeholder="password2"></el-input>-->
            <!--</el-form-item>-->
            <el-form-item>
                <el-button type="primary" @click="save">登  录</el-button>
            </el-form-item>
        </el-form>
    </div>
</template>

<script>
  import { ipcRenderer } from 'electron'
  export default {
    name: 'newPage',
    data () {
      return {
        areaList: [
          {
            value: 'cn-south',
            label: '华南'
          }, {
            value: 'cn-north',
            label: '华北'
          }, {
            value: 'cn-east',
            label: '华东'
          }, {
            value: 'cn-southwest',
            label: '西南'
          }],
        areaDef: 'cn-south',
        AppId: '',
        SecretId: '',
        SecretKey: '',
        password1: '',
        password2: ''
      }
    },
//    computed: {
//      backgrounds(){
//        return 'background:url("' + __static + '/images/bg-login.png")'
//      }
//    },
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