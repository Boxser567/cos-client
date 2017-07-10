<template>

</template>

<script>
  export default {
    name: 'uploadItem-page',
    props: ['index', 'file', 'key'],
    data(){},
    created(){
      this.fetchData()
    },
    methods: {
      fetchData(){
        console.log('this.my$store', this, this.$store)
      },
      selectLoadFile(e, types, id){},
      uploadFileCtrl(types, id){}
    }
  }
</script>
