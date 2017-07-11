/**
 * Created by gokuai on 17/6/7.
 */

import  { remote, ipcRenderer } from  'electron'

const state = {
  filelist: null,

  fileloading: true,

  uploadProgress: {
    list: null,
    status: false
  },

  fileUploadSelect: [],

  downloadProgress: {
    list: null,
    status: false
  },
  downloadSelect: [],

  uploadSpeed: null,

  downloadSpeed: null,

  isShowFileProgress: false,

  selectFile: [],

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

  newFolder: false, //新建文件夹

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
  showFileProgress(state){
    state.isShowFileProgress = !state.isShowFileProgress
  },
  updataProgress(state, data){    //初始化上传文件列表
    let dd = 0, idx

    // if (!state.uploadProgress.status) {
    state.uploadProgress.list = [].concat(data)
    // state.uploadProgress.status = true
    // }

    // data.forEach(function (item, index) {
    //   if (state.fileUploadSelect && state.fileUploadSelect.length) {
    //     if (item.id === state.fileUploadSelect[0].id) {
    //       item.active = true
    //       idx = index
    //     }
    //   }
    //   item.active = false
    // })
    // myidx = data.findIndex(n => n.id === state.fileUploadSelect[0].id)
    // state.uploadSpeed = dd
    // fileUploadSelect
    // if (state.fileUploadSelect && state.fileUploadSelect.length) {
    //   state.fileUploadSelect.forEach(function (upfile) {
    //     if (upfile) {
    //       let idx = data.findIndex(n => n.id === upfile.id)
    //       data[idx].active = true
    //     }
    //   })
    // }

    // console.log('总上传数量: ', data, '\n页面渲染列表: ')

  },
  downloadProgress(state, data){   //初始化下载文件列表
    // if (!state.downloadProgress.status) {
    state.downloadProgress.list = data
    // state.downloadProgress.status = true
    // state.downloadProgress.push()
    // }
  },
  selectFile(state, val) {       //选择文件
    if (!state.filelist) return

    if (val.key) {  //判断shiftkey
      if (state.selectFile && state.selectFile.length > 1) {
        //取最后一个的索引 和本次选择的索引组合
      } else if (state.selectFile && state.selectFile.length == 1) {
        let selectID = state.filelist.findIndex((n) => n.Name === state.selectFile[0].Name)
        let thisArr = [selectID, val.index]
        if (selectID == val.index) return
        if (selectID > val.index) {
          thisArr.reverse()
        }
        state.selectFile = []
        for (let i = thisArr[0]; i <= thisArr[1]; i++) {
          state.filelist[i].active = true
          state.selectFile.push(state.filelist[i])
        }
        state.filelist.push()
      } else {
        state.filelist.forEach(function (item, index) {
          if (index <= val.index) {
            item.active = true
          }
        })
      }

    } else {
      let chooseArr = []
      if (state.selectFile && state.selectFile.length) {
        state.selectFile.forEach((s) => {
          chooseArr.push(s.Name)
        })
        state.filelist.forEach((n) => {
          if (chooseArr.indexOf(n.Name) > -1) {
            n.active = false
          }
        })
      }
      state.filelist[val.index].active = true
      state.selectFile = []
      state.selectFile.push(val.file)
    }

  },
  unSelectFile(state){      //取消选中文件
    if (!state.selectFile) return
    state.selectFile.forEach(function (item) {
      let x = state.filelist.findIndex((n) => n.Name === item.Name)
      if (state.filelist[x] !== undefined) {
        state.filelist[x].active = false
      }
    })
    state.selectFile = []
  }
  ,
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

  selectLoadFile(state, arr){    //选中上传文件列表de文件
    if (!arr) return
    if (!state.uploadProgress.list && state.uploadProgress.list.length) return

    if (state.fileUploadSelect && state.fileUploadSelect.length) {
      state.fileUploadSelect.forEach(function (upfile) {
        let id = state.uploadProgress.list.findIndex(n => n.id === arr.upFile.id)
        if (id != undefined) {
          state.uploadProgress.list[id].active = false
          state.uploadProgress.list.push()
        }
      })
    }
    let idx = state.uploadProgress.list.findIndex(n => n.id === arr.upFile.id)
    if (idx != undefined) {
      state.uploadProgress.list[idx].active = true
      state.uploadProgress.list.push()
    }
    state.fileUploadSelect = []
    state.fileUploadSelect.push(arr.upFile)

  },

  selectDownloadFile(state, arr){
    // state.downloadSelect
    if (!arr) return
    if (!state.downloadProgress.list && state.downloadProgress.list.length) return
    if (state.downloadSelect && state.downloadSelect.length) {   //干掉已选中的状态
      state.downloadSelect.forEach(function (i) {
        state.downloadProgress.list[i].active = false
      })
    }
    //增加现在选中的状态
    state.downloadProgress.list[arr.upFile.id].active = true
    state.downloadSelect.push(arr.upFile.id)
    state.downloadProgress.list.push()
  },

  newFolder(state, val){
    state.newFolder = val
  },
  uploadFile(state, pms){
    remote.dialog.showOpenDialog({
      filters: [{name: 'All Files', extensions: ['*']}],
      properties: ['openFile', 'openDirectory', 'multiSelections']
    }, function (fileArray) {
      console.log(fileArray)
      if (!fileArray) return
      // fileArray.forEach(function (file) {
      //   let path = file
      //   let params = Object.assign({
      //     FileName: file
      //   }, pms)
      //   console.log(params)
      //   ipcRenderer.send('NewUploadTask', params)
      // })
      pms.FileNames = fileArray
      console.log('this-pms', pms)
      ipcRenderer.send('NewUploadTasks', pms)
    })
  },

  uploadFileCtrl(state, val){
    if (!val)return
    if (!state.uploadProgress.list) return
    console.log('this-state.uploadProgress', state.uploadProgress)

    switch (val.types) {
      case 'begin':
        let parmsBegin = {tasks: []}
        if (val.id) {
          parmsBegin.tasks.push(val.id)
        } else {
          state.uploadProgress.list.forEach(function (file) {
            if (state.fileUploadSelect.indexOf(file.id) > -1) {
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
          state.uploadProgress.list.forEach(function (file) {
            if (state.fileUploadSelect.indexOf(file.id) > -1) {
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
          state.uploadProgress.list.forEach(function (file) {
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
        state.uploadProgress.list.forEach(function (file) {
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
        state.uploadProgress.list.forEach(function (file) {
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
        state.uploadProgress.list.forEach(function (file) {
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
        state.uploadProgress.list.forEach(function (file) {
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
  downloadFile(state, pms){
    if (!state.selectFile) return
    remote.dialog.showOpenDialog({
      buttonLabel: '选择',
      filters: [{name: 'All Files', extensions: ['*']}],
      properties: ['openDirectory']
    }, function (fileArray) {
      if (!fileArray) return
      let parms = Object.assign({
        Path: fileArray[0],
        Dirs: [],
        Keys: []
      }, pms)
      state.selectFile.forEach(n => {
        if (n.dir) {
          parms.Dirs.push(n.Name)
        } else {
          parms.Keys.push(n.Name)
        }
      })
      ipcRenderer.send('NewDownloadTasks', parms)
    })

  },
  downloadFileCtrl(state, val){
    if (!val)return
    if (!state.downloadProgress.list) return
    console.log('this-state.downloadProgress', state.downloadProgress)

    switch (val.types) {
      case 'begin':
        let parmsBegin = {tasks: []}
        if (val.id) {
          parmsBegin.tasks.push(val.id)
        } else {
          state.downloadProgress.list.forEach(function (file) {
            if (state.downloadSelect.indexOf(file.id) > -1) {
              parmsBegin.tasks.push(file.id)
            }
          })
        }
        if (parmsBegin.tasks.length) {
          ipcRenderer.send('ResumeDownloadTask', parmsBegin)
        }
        break
      case  'purse':
        let parmsPurse = {tasks: []}
        if (val.id) {
          parmsPurse.tasks.push(val.id)
        } else {
          state.downloadProgress.list.forEach(function (file) {
            if (state.downloadSelect.indexOf(file.id) > -1) {
              parmsPurse.tasks.push(file.id)
            }
          })
        }
        if (parmsPurse.tasks.length) {
          ipcRenderer.send('PauseDownloadTasks', parmsPurse)
        }
        break
      case  'cancel':
        let parmsCancel = {tasks: []}
        if (val.id) {
          parmsCancel.tasks.push(val.id)
        } else {
          state.downloadProgress.list.forEach(function (file) {
            if (state.downloadSelect.indexOf(file.id) > -1) {
              parmsCancel.tasks.push(file.id)
            }
          })
        }
        if (parmsCancel.tasks.length) {
          ipcRenderer.send('DeleteDownloadTasks', parmsCancel)
        }
        break
      case 'allBegin':    //全部开始
        let parmsAllBegin = {tasks: []}
        state.downloadProgress.list.forEach(function (file) {
          if (file.status === 'pause') {
            parmsAllBegin.tasks.push(file.id)
          }
        })
        if (parmsAllBegin.tasks.length) {
          ipcRenderer.send('ResumeDownloadTask', parmsAllBegin)
        }
        break
      case 'allPurse':    //全部暂停
        let parmsAllPurse = {tasks: []}
        state.downloadProgress.list.forEach(function (file) {
          if (['run', 'wait'].indexOf(file.status) > -1) {
            parmsAllPurse.tasks.push(file.id)
          }
        })
        if (parmsAllPurse.tasks.length) {
          ipcRenderer.send('PauseDownloadTasks', parmsAllPurse)
        }
        break
      case 'allCancel':   //全部取消
        let parmsAllCancel = {
          tasks: []
        }
        state.downloadProgress.list.forEach(function (file) {
          if (['wait', 'run', 'pause', 'error'].indexOf(file.status) > -1) {
            parmsAllCancel.tasks.push(file.id)
          }
        })
        if (parmsAllCancel.tasks.length) {
          ipcRenderer.send('DeleteDownloadTasks', parmsAllCancel)
        }
        break
      case 'clear':
        let parms = {tasks: []}
        state.downloadProgress.list.forEach(function (file) {
          if (file.status === 'complete') {
            parms.tasks.push(file.id)
          }
        })
        if (parms.tasks.length) {
          ipcRenderer.send('DeleteDownloadTasks', parms)
        }
        break
      default :
        break

    }

  }

}

const actions = {
  getFileList({commit}, params){

    return new Promise((resolve, reject) => {

      ipcRenderer.send('ListObject', params.pms)

      ipcRenderer.once('ListObject-data', function (event, data) {
        if (params.pms.Page) {
          data.keywords = params.pms.Keywords
          commit('searchFileList', data)
        } else {
          commit('getFileList', data)
        }
        resolve(data)
      })
      ipcRenderer.once('ListObject-error', function (event, err) {
        reject(err)
      })

    })

  },
  deleteFile({commit}, params){

    return new Promise((resolve, reject) => {
      ipcRenderer.send('DeleteObject', params.pms)

      ipcRenderer.once('DeleteObject-data', function (event, data) {
        resolve(data)
      })
      ipcRenderer.once('DeleteObject-error', function (event, err) {
        reject(err)
      })
    })
  }

}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
