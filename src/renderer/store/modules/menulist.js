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
  selectFile: null,

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
    let dd = 0

    data.forEach(function (item) {
      if (state.fileUploadSelectID && state.fileUploadSelectID.length) {
        if (state.fileUploadSelectID.indexOf(item.id) > -1) {
          item.active = true
        }
      }
      if (item.status === 'run') {
        dd += item.speed
      }
    })

    state.uploadSpeed = dd
    state.fileUploadProgress = data

    // console.log('总上传数量: ', data, '\n页面渲染列表: ')

  },
  downloadProgress(state, data){   //初始化下载文件列表
    console.log(data)
    state.fileDownloadProgress = data
  },
  selectFile(state, val) {       //选择文件
    if (!state.filelist) return
    let flag = []
    if (state.selectFile) {
      let temper = state.filelist.findIndex(n => state.selectFile[0] === n.Name)
      if (state.filelist[temper].active) {
        state.filelist[temper].active = false
      }
    }
    state.filelist[val.index].active = true
    flag.push(state.filelist[val.index].Name)
    state.selectFile = flag
  },
  clearSelectFile(state){
    let arr = [].concat(state.selectFile)

    function test () {
      if (arr[0] && arr.length) {
        let idx = state.filelist.findIndex(n => n.Name === arr[0])
        state.filelist[idx].active = false
        arr.splice(0, 1)
        test()
      }
    }

    test()
    state.selectFile = null
  },
  unSelectFile(state)
  {      //取消选中文件
    state.filelist.forEach(function (file) {
      file.active = false
    })
  }
  ,
  getFileList(state, data)
  {       //获取当前文件列表
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
  }
  ,
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
  deleteHttpDom(state, index)
  {
    state.fileHeaderInfo.data.splice(index, 1)
  },

  selectLoadFile(state, arr)
  {    //选中上传文件列表de文件
    if (!arr) return
    if (!state.fileUploadProgress && state.fileUploadProgress.length) return
    // if (arr.key) {
    //   if (!state.fileUploadSelectID.length) return
    //   state.fileUploadSelectID.push(arr.index)
    //   let Array = []
    //   if (state.fileUploadSelectID[0] > arr.index)
    //     state.fileUploadSelectID.reverse()
    //   state.fileUploadProgress.forEach(function (file) {
    //     if (state.fileUploadSelectID[0] <= file.id <= state.fileUploadSelectID[1]) {
    //       Array.push(file.id)
    //     }
    //   })
    //   state.fileUploadSelectID = Array
    // } else {
    //   state.fileUploadSelectID = [arr.index]
    //   state.fileUploadProgress[arr.id].active=true
    // }

    // state.fileUploadProgress[state.fileUploadSelectID].active = false
    // state.fileUploadProgress[arr.id].active = true
    // state.fileUploadSelectID = arr.id
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
  uploadFile({commit}, pms){
    remote.dialog.showOpenDialog({
      filters: [{name: 'All Files', extensions: ['*']}],
      properties: ['openFile', 'openDirectory', 'multiSelections']
    }, function (fileArray) {
      console.log(fileArray)
      if (!fileArray) return
      fileArray.forEach(function (file) {
        let path = file
        let params = Object.assign({
          FileName: file
        }, pms)
        console.log(params)
        ipcRenderer.send('NewUploadTask', params)
      })
      // pms.FileNames = fileArray
      // console.log('this-pms', pms)
      // ipcRenderer.send('NewUploadTasks', pms)
    })
  },
  downloadFile({state}, pms){
    if (!state.filelist.length) return
    if (!state.selectFile) return
    remote.dialog.showOpenDialog({
      buttonLabel: '选择',
      filters: [{name: 'All Files', extensions: ['*']}],
      properties: ['openDirectory']
    }, function (fileArray) {
      if (!fileArray) return
      pms.Path = fileArray[0]

      let files = state.filelist.find(n => n.Name === state.selectFile[0])
      if (files.dir) {
        pms.Dirs = ['' + files.Name + '']
      } else {
        pms.Keys = ['' + files.Name + '']
      }

      ipcRenderer.send('NewDownloadTasks', pms)
    })
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
