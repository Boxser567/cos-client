<!--设置Http头-->

<template>
    <el-dialog
            title="设置header"
            custom-class="dialog-header"
            :visible.sync="isShow"
            :before-close="closeDialog"
            size="small">
        <table class="my-el-table" cellpadding="0" cellspacing="0">
            <thead>
            <tr>
                <td>参数</td>
                <td>值</td>
                <td>操作</td>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(list,$index) in fileHeaderInfo.list">
                <td>

                    <div v-show="selectOpt(list)">
                        <el-select v-model="list.select" @change="selectHttpChange(list,$index)"
                                   placeholder="选择项目" size="small">
                            <el-option
                                    v-for="item in list.data"
                                    :key="item.value"
                                    :label="item.label"
                                    :value="item.value">
                            </el-option>
                        </el-select>
                    </div>

                    <div v-show="!selectOpt(list)">
                        <el-select v-model="list.select" @change="selectHttpChange(list,$index)"
                                   placeholder="选择.." size="small" style="width: 100px">
                            <el-option
                                    v-for="item in list.data"
                                    :key="item.value"
                                    :label="item.label"
                                    :value="item.value">
                            </el-option>
                        </el-select>
                        <el-input size="small" v-model="list.cosMeta" style="width: 90px"></el-input>
                    </div>
                </td>
                <td>
                    <el-input size="small" v-model="list.value"></el-input>
                </td>
                <td>
                    <a class="text" @click="deleteHttpDom($index)">删除</a>
                </td>
            </tr>
            </tbody>
        </table>


        <el-button type="text" @click="addElemHeader()"><i class="el-icon-plus"></i>添加参数</el-button>
        <div slot="footer" class="dialog-footer">
            <el-button @click="closeDialog">取 消</el-button>
            <el-button type="primary" @click="dialogSetHttpFn()">确 定</el-button>
        </div>
    </el-dialog>
</template>

<script>
  export default{
    props: ['isShow'],

    data () {
      return {
        fileHeaderInfo: {
          list: [{
            data: [
              {
                value: '1',
                label: 'Cache-Control'
              }, {
                value: '2',
                label: 'Content-Type'
              }, {
                value: '3',
                label: 'Content-Disposition'
              }, {
                value: '4',
                label: 'Content-Language'
              }, {
                value: '5',
                label: 'Content-Encoding'
              }, {
                value: '6',
                label: 'x-cos-meta'
              }],
            cosMeta: '',
            value: '',
            select: ''
          }]
        }
      }
    },

    methods: {
      selectHttpChange (list, index) {
        console.log('----------', list)
      //        this.fileHeaderInfo.list.forEach(function (item, idx) {
      //          if (idx === parms.index) {
      //            item.select = parms.list.select
      //          }
      //        })
      },
      selectOpt: function (list) {
        return list.select !== '6'
      },
      addElemHeader () {
        let initialData = [{
          value: '1',
          label: 'Cache-Control'
        }, {
          value: '2',
          label: 'Content-Type'
        }, {
          value: '3',
          label: 'Content-Disposition'
        }, {
          value: '4',
          label: 'Content-Language'
        }, {
          value: '5',
          label: 'Content-Encoding'
        }, {
          value: '6',
          label: 'x-cos-meta'
        }]
        this.fileHeaderInfo.list.push({data: initialData, value: '', select: '', cosMeta: ''})
      },
      deleteHttpDom (index) {
        this.fileHeaderInfo.list.splice(index, 1)
      },
      dialogSetHttpFn () {
        console.log(this.fileHeaderInfo)
        this.$message('提交信息')
      },
      closeDialog () {
        this.$emit('closeDialog')
      }

    }

  }
</script>