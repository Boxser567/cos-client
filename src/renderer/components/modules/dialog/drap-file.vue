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
        </el-dialog>
    </div>

</template>


<script>
  export default {

    props: ['isShow'],
    data () {
      return {
        dropActive: false
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
        if (files.length === 0) return
        files = Array.from(files)
        let fileArray = files.map(n => {
          return n.path
        })
        this.$store.dispatch('menulist/uploadFileByDrag', fileArray)
      },
      closeDialog () {
        this.$emit('update:isShow', false)
      }
    }

  }
</script>