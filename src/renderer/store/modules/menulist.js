/**
 * Created by gokuai on 17/6/7.
 */
import { ipcRenderer, remote } from 'electron'

const state = {
  options: {
    Bucket: '',
    Region: '',
    Prefix: ''
  },

  filelist: null,

  fileloading: true,

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
      key: 'set_limit',
      name: '设置权限',
      index: 8,
      isActive: false
    },
    {
      key: 'paste_file',
      name: '粘贴',
      index: 9,
      isActive: false
    },
    {
      key: 'download_list',
      name: '下载当前目录',
      index: 10,
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
  options (state, val) {
    state.options = val
  },

  fileloading (state, val) { // 文件加载
    state.fileloading = val.loading
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
    state.filelist = Arr.filter((n) => {
      if (n.Name.indexOf(data.keywords) > -1) {
        return n
      }
    })
  },

  newFolder (state, val) {
    state.newFolder = val
  },

  copyFiles (state) {
    state.copyFiles.src = state.options
    state.copyFiles.list = state.selectFile
  },

  copyFilesNone (state) {
    state.copyFiles.src = null
    state.copyFiles.list = []
  }
}

const actions = {
  async getFileList ({commit, rootGetters}, params) {
    commit('fileloading', {loading: true})
    let data
    try {
      data = await listDir(rootGetters.cos, params)
      if (params.Page) {
        data.keywords = params.Keywords
        commit('searchFileList', data)
      } else {
        commit('getFileList', data)
      }
    } catch (e) {
      console.error(e)
    }
    commit('fileloading', {loading: false})
    return data
  },

  uploadFile ({state}) {
    remote.dialog.showOpenDialog({
      filters: [{name: 'All Files', extensions: ['*']}],
      properties: ['openFile', 'openDirectory', 'multiSelections']
    }, FileNames => {
      if (!FileNames) return
      ipcRenderer.send('NewUploadTasks', Object.assign({FileNames}, state.options))
    })
  },

  downloadFile ({state}) {
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
      }, state.options)
      state.selectFile.forEach(n => {
        if (n.dir) {
          parms.Dirs.push(n.Prefix)
        } else {
          parms.Keys.push(n.Key)
        }
      })
      // console.log(state.selectFile, '下载canshu', parms)
      ipcRenderer.send('NewDownloadTasks', parms)
    })
  },

  pasteFiles ({dispatch, state}) {
    if (state.copyFiles.list.length < 1) return Promise.resolve()
    let parms = {
      src: state.copyFiles.src,
      dst: state.options,
      Dirs: [],
      Keys: []
    }
    state.copyFiles.list.forEach(n => {
      if (n.dir) {
        parms.Dirs.push(n.Prefix)
      } else {
        parms.Keys.push(n.Key)
      }
    })
    return dispatch('copyObjects', parms, {root: true})
  }
}

async function listDir (cos, params) {
  let dirs = []
  let objects = []
  params.Delimiter = '/'
  let result
  let pflen = params.Prefix ? params.Prefix.length : 0

  do {
    result = await new Promise((resolve, reject) => {
      cos.getBucket(params, (err, result) => { err ? reject(err) : resolve(result) })
    })

    result.CommonPrefixes.forEach(v => {
      if (v.Prefix !== params.Prefix) {
        dirs.push({
          Name: v.Prefix.slice(pflen, -1),
          Prefix: v.Prefix
        })
      }
    })
    result.Contents.forEach(v => objects.push(Object.assign({Name: v.Key.slice(pflen)}, v)))

    params.Marker = result.NextMarker
  } while (result.IsTruncated === 'true')
  return {dirs, objects}
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
