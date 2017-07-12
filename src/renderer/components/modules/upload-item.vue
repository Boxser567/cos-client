<template>
    <div class="listWrap">
        <VirtualList class="list"
                     :size="40"
                     :remain="4"
                     :tobottom="toBottom"
                     :totop="totop"
        >
            <Item v-for="(item, $index) in items" :index="$index" :key="$index"></Item>
        </VirtualList>
        <Loading class="list-loading" :loading="loading"></Loading>
    </div>
</template>

<script>
  import { mapState } from 'vuex'
  import Item from './item.vue'
  import Loading from './loading.vue'
  import VirtualList from 'vue-virtual-scroll-list'
  export default {
    name: 'infinite-test',
    components: {Item, VirtualList, Loading},
    computed: {
      uploadProgress(){
        return this.$store.state.menulist.uploadProgress
      }
    },
    data () {
      return {
        page: 0,
        loading: false,
        items: []
      }
    },
    created(){
      this.getList()
    },
    watch: {
      'uploadProgress': {
        handler: function () {
          this.getList()
        },
        deep: true
      }
    },
    methods: {
      getList(){
        console.log('uploadProgress', this.uploadProgress)
        this.loading = true
        if (this.uploadProgress.list && this.uploadProgress.list.length) {
          for (let i = this.page * 20, len = (this.page + 1) * 20; i < len; i++) {
            if (this.uploadProgress.list[i])
              this.items.push(this.uploadProgress.list[i])
          }
          this.page++
        }
        this.loading = false
        if(this.page>4){

        }
      },
      toBottom () {
        if (!this.loading) {

          this.getList()
        }
      },
      totop(){

      }
    }
  }
</script>


<style scoped>
    .counter {
        position: relative;
        padding-bottom: 20px;
    }

    .count {
        position: absolute;
        right: 0;
    }

    .listWrap {
        position: relative;
    }

    .list-loading {
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
    }

    .list {
        background: #fff;
        border-radius: 3px;
        -webkit-overflow-scrolling: touch;
        overflow-scrolling: touch;
    }

    .source {
        text-align: center;
        padding-top: 20px;
    }

    .source a {
        color: #999;
        text-decoration: none;
        font-weight: 100;
    }

    @media (max-width: 640px) {
        .times, .count {
            display: block;
        }

        .count {
            position: relative;
        }
    }
</style>

