/**
 * Created by gokuai on 17/6/7.
 */

import { ipcRenderer, remote } from 'electron'

const state = {
  filelist: null,

  fileloading: true,

  uploadProgress: {
    list: [],
    status: false,
    loading: false,
    count: 20,
    page: 0
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
      name: '上传文件',
      index: 1,
      isActive: false
    },
    {
      key: 'new_folder',
      name: '创建文件夹',
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
    }
  ],

  newFolder: false, // 新建文件夹

  copyFiles: {
    list: [],
    src: null
  }
}

const mutations = {
  fileloading (state, val) { // 文件加载
    state.fileloading = val.loading
  },

  showFileProgress (state) {
    state.isShowFileProgress = !state.isShowFileProgress
  },

  updataProgress (state, data) { // 初始化上传文件列表
    console.log('data', data)
    if (!state.uploadProgress.status) {
      state.uploadProgress.list = data
      state.uploadProgress.status = true
    }

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

  uploadItemAdd (state) {
    if (state.uploadProgress.list.length > state.uploadItem.length) {
      state.uploadProgress.loading = true
      if (state.uploadProgress.page === 0) {
        state.uploadItem = []
      }
      let j = state.uploadProgress.page * state.uploadProgress.count
      let len = j + 20// (state.uploadProgress.page + 1) * state.uploadProgress.count
      for (; j < len; j++) {
        if (state.uploadProgress.list[j]) { state.uploadItem.push(state.uploadProgress.list[j]) }
      }
      if (state.uploadItem.length > 40) {
        let m = 0
        let subLen = state.uploadItem.length - 40
        for (; m < subLen; m++) {
          state.uploadItem.splice(0, 1)
        }
      }
      state.uploadProgress.page += 1
      state.uploadProgress.loading = false
    }
  },

  uploadItemSub (state) {
    if (state.uploadProgress.page === 0) return
    state.uploadProgress.loading = true
    if (state.uploadProgress.page > 0) {
      let j = (state.uploadProgress.page - 2) * state.uploadProgress.count
      let len = j + 20
      if (j >= 0) {
        for (; len > j; len--) {
          if (state.uploadProgress.list[len]) { state.uploadItem.unshift(state.uploadProgress.list[len]) }
        }
      }
    }
    if (state.uploadItem.length > 40) {
      // 删除末尾20条数据
      let n = (state.uploadProgress.page - 1) * state.uploadProgress.count
      let dlen = n + 20
      for (; n < dlen; n++) {
        if (state.uploadItem[n]) { state.uploadItem.splice(n, 1) }
      }
    }
    state.uploadProgress.loading = false
    state.uploadProgress.page -= 1
  },

  uploadLoading (state, val) {
    state.uploadProgress.loading = val
  },

  downloadProgress (state, data) { // 初始化下载文件列表
    // if (!state.downloadProgress.status) {
    state.downloadProgress.list = data
    // state.downloadProgress.status = true
    // state.downloadProgress.push()
    // }
  },

  selectFile (state, val) { // 选择文件
    if (!state.filelist) return

    if (val.key) { // 判断shiftkey
      if (state.selectFile && state.selectFile.length > 1) {
        // 取最后一个的索引 和本次选择的索引组合
      } else if (state.selectFile && state.selectFile.length === 1) {
        let selectID = state.filelist.findIndex((n) => n.Name === state.selectFile[0].Name)
        let thisArr = [selectID, val.index]
        if (selectID === val.index) return
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
            state.selectFile.push(item)
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

  unSelectFile (state) { // 取消选中文件
    if (!state.selectFile) return
    if (state.selectFile.length === 0 || state.filelist.length === 0) return
    state.selectFile.forEach(function (item) {
      let x = state.filelist.findIndex(n => n.Name === item.Name)
      if (state.filelist[x]) {
        state.filelist[x].active = false
        // Vue.set(state.filelist[x], 'active', false)
      }
    })
    state.selectFile = []
  },

  getFileList (state, data) { // 获取当前文件列表
    // console.log('当前文件列表', data)
    let index = null
    if (data.objects.length) {
      data.objects.forEach(function (item, idx) {
        if (item.Name === '') index = idx
        item.active = false
      })
    }
    if (data.dirs.length) {
      data.dirs.forEach(function (d) {
        d.active = false
        d.dir = true
      })
    }
    if (index !== null) data.objects.splice(index, 1)
    state.filelist = data.objects.concat(data.dirs)
  },

  searchFileList (state, data) { // 搜索文件
    let index = null
    if (data.objects.length) {
      data.objects.forEach(function (item, idx) {
        if (item.Name === '') index = idx
        item.active = false
      })
    }
    if (data.dirs.length) {
      data.dirs.forEach(function (d) {
        d.active = false
        d.dir = true
      })
    }
    if (index !== null) data.objects.splice(index, 1)
    let Arr = data.objects.concat(data.dirs)
    let serchlist = Arr.filter((n) => {
      if (n.Name.indexOf(data.keywords) > -1) {
        return n
      }
    })
    state.filelist = serchlist
  },

  selectLoadFile (state, arr) { // 选中上传文件列表de文件
    let listArr = [].concat(state.uploadProgress.list)
    if (!listArr && listArr.length) return

    if (state.uploadSelect.length === 0) {
      state.uploadSelect.push(arr.upFile.id)
    }
    if (state.uploadSelect.length === 1) {
      if (state.uploadSelect[0] === arr.upFile.id) {
        state.uploadSelect = []
      } else {
        if (!arr.key) {
          state.uploadSelect.splice(0, 1)
          state.uploadSelect.push(arr.upFile.id)
        } else {
          let arr = [state.uploadSelect[0], arr.upFile.id]
          for (let i = state.uploadSelect[0]; i < listArr.length; i++) {

          }
        }
      }
    }
    if (state.uploadSelect.length > 1) {
      state.uploadSelect = []
      state.uploadSelect.push(arr.upFile.id)
    }

    // if (state.fileUploadSelect && state.fileUploadSelect.length) {
    //   state.fileUploadSelect.forEach(function (upfile) {
    //     let id = state.uploadProgress.list.findIndex(n => n.id === arr.upFile.id)
    //     if (id != undefined) {
    //       state.uploadProgress.list[id].active = false
    //       state.uploadProgress.list.push()
    //     }
    //   })
    // }
    //
    // let idx = state.uploadProgress.list.findIndex(n => n.id === arr.upFile.id)
    //
    // if (idx != undefined) {
    //   state.uploadProgress.list[idx].active = true
    //   state.uploadProgress.list.push()
    // }
    //
    // state.fileUploadSelect = []
    // state.fileUploadSelect.push(arr.upFile)
  },

  selectDownloadFile (state, arr) {
    // state.downloadSelect
    if (!arr) return
    if (!state.downloadProgress.list && state.downloadProgress.list.length) return
    if (state.downloadSelect && state.downloadSelect.length) { // 干掉已选中的状态
      state.downloadSelect.forEach(function (i) {
        state.downloadProgress.list[i].active = false
      })
    }
    // 增加现在选中的状态
    state.downloadProgress.list[arr.upFile.id].active = true
    state.downloadSelect.push(arr.upFile.id)
    state.downloadProgress.list.push()
  },

  newFolder (state, val) {
    state.newFolder = val
  },

  uploadFile (state, pms) {
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

  downloadFile (state, pms) {
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

  copyFiles (state, pms) {
    state.copyFiles.src = pms
    state.copyFiles.list = state.selectFile
  }
}

const actions = {
  getFileList ({commit}, params) {
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
    })
  },
  deleteFile ({commit, dispatch, state}, params) {
    if (state.selectFile.length < 1) return Promise.resolve()
    params.Dirs = []
    params.Keys = []
    console.log('888888', params)
    state.selectFile.forEach(n => {
      if (n.dir) {
        params.Dirs.push(n.Prefix)
      } else {
        params.Keys.push(n.Key)
      }
    })

    return dispatch('deleteObjects', params, {root: true})
  },

  pasteFiles ({commit, dispatch, state}, params) {
    if (state.copyFiles.list.length < 1) return Promise.resolve()
    let parms = {
      dst: {
        Bucket: params.Bucket,
        Region: params.Region,
        Prefix: params.Prefix
      },
      Dirs: [],
      Keys: []
    }
    parms.src = state.copyFiles.src
    state.copyFiles.list.forEach(n => {
      if (n.dir) {
        parms.Dirs.push(n.Prefix)
      } else {
        parms.Keys.push(n.Key)
      }
    })

    console.log('this.pasteFiles', parms)

    return dispatch('copyObjects', parms, {root: true})
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
