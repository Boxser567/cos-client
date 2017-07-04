/**
 * Created by gokuai on 17/6/7.
 */

import  { remote, ipcRenderer } from  'electron'

const state = {
  filelist: null,

  fileloading: true,
  fileUploadProgress: null,
  fileUploadSelectID: null,
  fileDownloadProgress: null,
  uploadSpeed: null,
  downloadSpeed: null,
  selectFile: {
    select: false
  },

  fileRightList: [
    {
      key: 'upload_file',
      name: '点击上传',
      index: 1,
      isActive: false
    },
    {
      key: 'new_folder',
      name: '新建文件夹',
      index: 2,
      isActive: false
    },
    {
      key: 'download_file',
      name: '下载',
      index: 3,
      isActive: false
    },
    {
      key: 'copy_file',
      name: '复制',
      index: 4,
      isActive: false
    },
    {
      key: 'delete_file',
      name: '删除',
      index: 5,
      isActive: false
    },
    {
      key: 'get_address',
      name: '获取地址',
      index: 6,
      isActive: false
    },
    {
      key: 'set_http',
      name: '设置HTTP头',
      index: 7,
      isActive: false
    },
    {
      key: 'paste_file',
      name: '粘贴',
      index: 8,
      isActive: false
    },
    {
      key: 'download_list',
      name: '下载当前目录',
      index: 9,
      isActive: false
    },
  ],

  dialogGetHttp: {
    isShow: false,
    bucket: null,
    url: null
  },
  fileHeaderInfo: {
    isShow: false,
    initialData: [{
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
    data: [{
      date: [{
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

const mutations = {
  fileloading(state, val){    //文件加载
    state.fileloading = val.loading
  },
  updataProgress(state, data){    //初始化上传文件列表
    console.log(333, data)
    let dd = 0
    if (state.fileUploadSelectID) {
      data.forEach(function (d) {
        if (state.fileUploadSelectID.indexOf(d.id) > -1) {
          d.active = true
        }
        if (d.status === 'cpmplete') {
          dd += d.speed
        }
      })
    }
    state.uploadSpeed = dd
    state.fileUploadProgress = data
  },
  downloadProgress(state, data){   //初始化下载文件列表
    state.fileDownloadProgress = data
  },
  selectFile(state, val){       //选择文件
    state.filelist.forEach(function (file) {
      file.active = false
      if (file.Name === val.fileName) {
        file.active = true
        file.select = true
        file.url = ''
        state.selectFile = file
      }
    })
  },
  unSelectFile(state){      //取消选中文件
    state.filelist.forEach(function (file) {
      file.active = false
    })
    state.selectFile = {
      select: false
    }
  },
  getFileList(state, data){       //获取当前文件列表
    // console.log('当前文件列表', data)
    let index = null
    if (data.objects.length) {
      data.objects.forEach(function (item, idx) {
        if (item.Name == '') index = idx
        item.active = false
      })
    }
    if (data.dirs.length) {
      data.dirs.forEach(function (d) {
        d.active = false
        d.dir = true
      })
    }
    if (index != null) data.objects.splice(index, 1)
    state.filelist = data.objects.concat(data.dirs)
  },
  searchFileList(state, data){    //搜索文件
    let index = null
    if (data.objects.length) {
      data.objects.forEach(function (item, idx) {
        if (item.Name == '') index = idx
        item.active = false
      })
    }
    if (data.dirs.length) {
      data.dirs.forEach(function (d) {
        d.active = false
        d.dir = true
      })
    }
    if (index != null) data.objects.splice(index, 1)
    let Arr = data.objects.concat(data.dirs)
    let serchlist = Arr.filter((n) => {
      if (n.Name.indexOf(data.keywords) > -1) {
        return n
      }
    })
    state.filelist = serchlist
  },

  getFileHttp(state, param){      //获取文件 地址
    console.log(state.selectFile)
    if (state.selectFile)
      state.dialogGetHttp = {
        isShow: true,
        bucket: param.Bucket,
        url: 'http://' + param.Bucket + '-1253834952.' + param.Region + '.myqcloud.com/' + state.selectFile.Key
      }
  },
  setFileHttpHidden(state){     //文件地址 模态窗口显示隐藏
    state.dialogGetHttp.isShow = false
  },
  setHttp(state, val){          //Http 模态窗显示隐藏
    if (val === 'cancel')
      state.fileHeaderInfo.isShow = false
    else {
      state.fileHeaderInfo.isShow = true
    }
  },
  selectHttpChange(state, parms){
    state.fileHeaderInfo.data.forEach(function (item, idx) {
      if (idx === parms.index) {
        item.select = parms.list.select
      }
    })
  },
  addHttpDom(state){
    state.fileHeaderInfo.data.push({date: state.fileHeaderInfo.initialData, value: '', select: '', cosMeta: ''})
  },
  deleteHttpDom(state, index){
    state.fileHeaderInfo.data.splice(index, 1)
  },

  selectLoadFile(state, arr){    //选中上传文件列表de文件
    if (!arr) return
    if (!state.fileUploadProgress.length) return
    if (arr.key) {
      if (!state.fileUploadSelectID.length) return
      state.fileUploadSelectID.push(arr.index)
      let Array = []
      if (state.fileUploadSelectID[0] > arr.index)
        state.fileUploadSelectID.reverse()
      state.fileUploadProgress.forEach(function (file) {
        if (state.fileUploadSelectID[0] <= file.id <= state.fileUploadSelectID[1]) {
          Array.push(file.id)
        }
      })
      state.fileUploadSelectID = Array

    } else {
      state.fileUploadSelectID = [arr.index]
    }
    console.log('state.fileUploadSelectID', state.fileUploadSelectID)

    // console.log('checkMyfile', state.fileUploadProgress)
  }
}

const actions = {
  getFileList({commit, rootGetters}, params){
    return new Promise((resolve, reject) => {
      rootGetters.userConfig.listObject(params.pms).then(function (resp) {
        if (params.pms.Page) {
          resp.keywords = params.pms.Keywords
          commit('searchFileList', resp)
        } else {
          commit('getFileList', resp)
        }
        resolve()
      })
    })
  },
  sliceUploadFile({}, params){
    ipcRenderer.send('NewUploadTask', params)
  },
  deleteFile({commit, rootGetters}, params){
    return new Promise((resolve, reject) => {
      rootGetters.userConfig.cos.deleteObject(params.pms, function (err, data) {
        console.log('this----', arguments)
        if (!err) {
          resolve(data)
        } else {
          reject(err)
        }
      })
    })
  },
  showList({commit}, val){
    commit('showList', val)
  },
  selectFile({commit}, val){
    commit('selectFile', val.amount)
  },
  selectLoadFile({commit}, val){
    if (!val) return
    commit('selectLoadFile', val)
  },
  uploadFile({commit}, pms){
    remote.dialog.showOpenDialog({
      filters: [{name: 'All Files', extensions: ['*']}],
      properties: ['openFile', 'openDirectory', 'multiSelections']
    }, function (fileArray) {
      if (!fileArray) return
      fileArray.forEach(function (file) {
        let path = file
        let params = Object.assign({
          FileName: file
        }, pms)
        console.log(params)
        ipcRenderer.send('NewUploadTask', params)
      })
    })
  },
  downloadFile({commit, state}, pms){
    if (!state.filelist.length) return

    // remote.dialog.showSaveDialog({}, function (saveArray) {
    //   console.log('saveArray', saveArray)
    // })
    remote.dialog.showOpenDialog({
      filters: [{name: 'All Files', extensions: ['*']}],
      properties: ['openFile', 'multiSelections']
    }, function (fileArray) {
      if (!fileArray) return

    })

    // state.filelist.forEach(function (file) {
    //   if (file.active) {
    //     console.log(file)
    //     let list = Object.assign(pms, {
    //       FileName: file.Key || file.Prefix,
    //       Key: file.Name
    //     })
    //     ipcRenderer.send('NewDownloadTask', list)
    //   }
    // })
  },
  uploadFileCtrl({commit, state}, val){
    if (!val)return
    if (!state.fileUploadProgress) return
    console.log('this-state.fileUploadProgress', state.fileUploadProgress)
    let cs = val
    if (val.id) cs = val.types

    switch (cs) {
      case 'begin':
        let parmsBegin = {tasks: []}
        if (val.id) {
          parmsBegin.tasks.push(val.id)
        } else {
          state.fileUploadProgress.forEach(function (file) {
            if (state.fileUploadSelectID.indexOf(file.id) > -1) {
              parmsBegin.tasks.push(file.id)
            }
          })
        }
        if (parmsBegin.tasks.length) {
          ipcRenderer.send('ResumeUploadTask', parmsBegin)
        }
        break
      case 'purse':
        let parmsPurse = {tasks: []}
        if (val.id) {
          parmsPurse.tasks.push(val.id)
        } else {
          state.fileUploadProgress.forEach(function (file) {
            if (state.fileUploadSelectID.indexOf(file.id) > -1) {
              parmsPurse.tasks.push(file.id)
            }
          })
        }
        if (parmsPurse.tasks.length) {
          ipcRenderer.send('PauseUploadTasks', parmsPurse)
        }
        break
      case 'cancel':      //取消
        let parmsCancel = {tasks: []}
        if (val.id) {
          parmsCancel.tasks.push(val.id)
        } else {
          state.fileUploadProgress.forEach(function (file) {
            if (state.fileUploadSelectID.indexOf(file.id) > -1) {
              parmsCancel.tasks.push(file.id)
            }
          })
        }
        if (parmsCancel.tasks.length) {
          ipcRenderer.send('DeleteUploadTasks', parmsCancel)
        }
        break
      case 'allBegin':    //全部开始
        let parmsAllBegin = {tasks: []}
        state.fileUploadProgress.forEach(function (file) {
          if (file.status === 'pause') {
            parmsAllBegin.tasks.push(file.id)
          }
        })
        if (parmsAllBegin.tasks.length) {
          ipcRenderer.send('ResumeUploadTask', parmsAllBegin)
        }
        break
      case 'allPurse':    //全部暂停
        let parmsAllPurse = {tasks: []}
        state.fileUploadProgress.forEach(function (file) {
          if (['run', 'wait'].indexOf(file.status) > -1) {
            parmsAllPurse.tasks.push(file.id)
          }
        })
        if (parmsAllPurse.tasks.length) {
          ipcRenderer.send('PauseUploadTasks', parmsAllPurse)
        }
        break
      case 'allCancel':   //全部取消
        let parmsAllCancel = {
          tasks: []
        }
        state.fileUploadProgress.forEach(function (file) {
          if (['wait', 'run', 'pause', 'error'].indexOf(file.status) > -1) {
            parmsAllCancel.tasks.push(file.id)
          }
        })
        if (parmsAllCancel.tasks.length) {
          // ipcRenderer.send('PauseUploadTasks', parmsAllCancel)
          ipcRenderer.send('DeleteUploadTasks', parmsAllCancel)
        }
        break
      case 'clear':
        let parms = {tasks: []}
        state.fileUploadProgress.forEach(function (file) {
          if (file.status === 'complete') {
            parms.tasks.push(file.id)
          }
        })
        if (parms.tasks.length) {
          ipcRenderer.send('DeleteUploadTasks', parms)
        }
        break
      default:
        break
    }
  },
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
