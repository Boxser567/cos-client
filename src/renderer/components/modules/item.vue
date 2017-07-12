<template>
    <div class="item">
        <span>Item # {{ index }}</span>
    </div>
</template>

<script>
  export default {
    props: {
      index: Number
    }
  }
</script>

<style scoped>
    .item {
        height: 40px;
        line-height: 40px;
        padding-left: 20px;
        border-bottom: 1px solid #eee;
    }
</style>