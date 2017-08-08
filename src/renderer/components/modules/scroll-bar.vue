<template>
    <table>
        <tr>
            <td v-for="item in list" :class="item.color" :style="{width: item.width + '%'}"></td>
        </tr>
    </table>
</template>

<script>
  export default {
    data () {
      return {
        list: []
      }
    },
    created () {
      let i = 0
      this.obj = setInterval(() => {
        if (i < 14) {
          this.list = [
            {width: i, color: 'black'},
            {width: 20, color: 'aqua'},
            {width: 13, color: 'black'},
            {width: 20, color: 'aqua'},
            {width: 13, color: 'black'},
            {width: 20, color: 'aqua'},
            {width: 14 - i, color: 'black'}
          ]
        } else {
          this.list = [
            {width: i - 13, color: 'aqua'},
            {width: 14, color: 'black'},
            {width: 20, color: 'aqua'},
            {width: 13, color: 'black'},
            {width: 20, color: 'aqua'},
            {width: 13, color: 'black'},
            {width: 34 - i, color: 'aqua'}
          ]
        }
        i++
        i %= 32
      }, 50)
    },
    beforeDestroy () {
      clearInterval(this.obj)
    },
    computed: {},
    methods: {}
  }
</script>

<style scoped>
    table {
        -webkit-border-horizontal-spacing: 0;
        -webkit-border-vertical-spacing: 0;
        margin: 0;
        padding: 0;
        height: 2px;
        width: 100%;
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
    }

    td {
        height: 2px;
    }

    .aqua {
        background-color: aqua;
    }

    .black {
        background-color: black;
    }
</style>
