<template>
    <div class="slide-right">
        <div class="drag">

            <div class="welcometo">
                <img :src="welimg" alt="">
                <p class="tl">欢迎使用 COS 控制台</p>
                <p class="sub">点击左侧栏的 <a @click="newBucket">新建</a> 按钮，开始创建您的 Bucket 吧 </p>
            </div>
        </div>

    </div>
</template>

<script>
  export default {
    name: 'container-page',
    data () {
      return {
        welimg: './static/images/welcome.png'
      }
    },
    methods: {
      newBucket(){
        this.$emit('createBucket')
      }
    }
  }
</script>

<style lang="scss">
    @import "container.scss";
</style>
