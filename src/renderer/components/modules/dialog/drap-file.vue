<template>

    <div>
        <el-dialog title="上传文件" custom-class="dialog-upload" :visible.sync="isShow"
                   :before-close="closeDialog"
                   size="small">
            <div class="drop-content" :class="{ 'active':dropActive }"
                 @dragover.prevent="onDragover"
                 @drop.prevent="onDrop"
                 @dragleave.prevent="onDragLeave">
                <i class="el-icon-upload"></i>
                <p>将文件拖到此处</p>
            </div>


            <div class="draglist">
                <virtual-scroller v-if="uploadlist && uploadlist.length"
                                  :items="uploadlist" item-height="32" content-tag="div">
                    <template scope="props">
                        <div class="list"
                             @click="itemSelect(props.itemIndex)"
                             :key="props.item.name">
                            <el-checkbox v-model="props.item.isCheck"></el-checkbox>
                            <div class="name">
                                <!--<img :src="props.item | getFileImg" alt="">-->
                                <p>{{ props.item.name }}</p>
                            </div>
                        </div>
                    </template>
                </virtual-scroller>
            </div>


        </el-dialog>
    </div>

</template>


<script>
  export default {

    props: ['isShow'],
    data () {
      return {
        dropActive: false,
        uploadlist: []
      }
    },
    created () {

    },
    computed: {},
    methods: {
      onDragover () {
        this.dropActive = true
      },
      onDragLeave () {
        this.dropActive = false
      },
      onDrop (e) {
        this.dropActive = false
        let files = e.dataTransfer.files
        console.log('files', files)
        if (files.length === 0) return
        files = Array.from(files)
        let fileArray = files.map(n => {
          return {
            name: n.path.replace(/\\/g, '/').replace(/.*\//, ''),
            isCheck: true
          }
        })
        console.log(fileArray)
        this.$message('暂时未做好')

//        this.$store.dispatch('menulist/uploadFileByDrag', fileArray)
      },
      closeDialog () {
        this.$emit('update:isShow', false)
      }
    }

  }
</script>