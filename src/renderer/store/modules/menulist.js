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

  search: {
    active: false,
    keyWord: ''
  },

  filelist: null,

  fileloading: true,

  selectFile: [],
  // 新建文件夹
  newFolder: false,

  copyFiles: {
    list: [],
    src: null
  }
}

const mutations = {
  options (state, val) {
    state.options = val
  },

  fileloading (state, val) {
    state.fileloading = val.loading
  },
  // 选择文件
  selectFile (state, val) {
    if (!val.key) {
      state.filelist.forEach((n, i) => {
        n.active = val.index === i
      })
      state.selectFile = [val.file]
    }
    if (state.selectFile.length === 0) {
      let arr = []
      for (let i = 0; i <= val.index; i++) {
        state.filelist[i].active = true
        arr.push(state.filelist[i])
      }
      state.selectFile = arr
      return
    }
    for (let i = 0; ; i++) {
      if (i === val.index && !state.filelist[i].active) {
        let arr = []
        for (; !state.filelist[i].active; i++) {
          state.filelist[i].active = true
          arr.push(state.filelist[i])
        }
        state.selectFile = arr.concat(state.selectFile)
        return
      }
      if (state.filelist[i].active) {
        let arr = []
        for (; i <= val.index; i++) {
          state.filelist[i].active = true
          arr.push(state.filelist[i])
        }
        state.selectFile = arr
        for (; i < state.filelist.length; i++) {
          state.filelist[i].active = false
        }
        return
      }
    }
  },

  unSelectFile (state) { // 取消选中文件
    state.filelist && state.filelist.forEach(f => {
      f.active = false
    })
    state.selectFile = []
  },
  // 获取当前文件列表
  getFileList (state, data) {
    let list = []
    data.dirs.forEach(d => {
      d.active = false
      d.dir = true
      list.push(d)
    })
    data.objects.forEach(obj => {
      if (obj.Name) {
        obj.active = false
        list.push(obj)
      }
    })
    state.filelist = list
    state.selectFile = []
    state.search = {
      active: false,
      keyWord: ''
    }
  },
  // 搜索文件
  searchFileList (state, data) {
    let arr = data.dirs.filter(obj => {
      if (obj && obj.Name.indexOf(data.keyWord) > -1) {
        obj.active = false
        obj.dir = true
        return obj
      }
    })
    let arr1 = data.objects.filter(obj => {
      if (obj && obj.Name.indexOf(data.keyWord) > -1) {
        obj.active = false
        return obj
      }
    })
    state.filelist = arr.concat(arr1)
    state.selectFile = []
    state.search = {
      active: true,
      keyWord: data.keyWord
    }
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
  async getFileList ({commit, state, rootGetters}, keyWord) {
    commit('fileloading', {loading: true})
    try {
      if (keyWord) {
        let data = await listDir(rootGetters.cos, state.options)
        data.keyWord = keyWord
        commit('searchFileList', data)
      } else {
        let data = await listDir(rootGetters.cos, state.options)
        commit('getFileList', data)
      }
    } catch (err) {
      rootGetters.bus.$emit('globleError', err)
    }
    commit('fileloading', {loading: false})
  },

  mkDir ({rootGetters}, params) {
    return new Promise((resolve, reject) => {
      params.Body = Buffer.from('')
      rootGetters.cos.putObject(params, function (err, data) {
        if (err) rootGetters.bus.$emit('globleError', err)
        err ? reject(err) : resolve(data)
      })
    })
  },

  uploadFile ({state}) {
    remote.dialog.showOpenDialog({
      filters: [{name: 'All Files', extensions: ['*']}],
      properties: ['openFile', 'openDirectory', 'multiSelections']
    }, FileNames => {
      if (!FileNames) return
      console.log('FileNames', FileNames)
      ipcRenderer.send('NewUploadTasks', Object.assign({FileNames}, state.options))
    })
  },

  uploadFileByDrag({state}, fileArr) {
    if (!fileArr) return
    console.log('fileArr1', fileArr, state.options)
    ipcRenderer.send('NewUploadTasks', Object.assign({FileNames: fileArr}, state.options))
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
    if (!state.copyFiles.list.length) return Promise.resolve()

    if (state.options.Bucket === state.copyFiles.src.Bucket &&
      state.options.Prefix === state.copyFiles.src.Prefix) {
      return Promise.reject(new Error('same path'))
    }

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

async function searchDir (cos, params) {
  let objects = []
  let result
  let pflen = params.Prefix ? params.Prefix.length : 0

  do {
    result = await new Promise((resolve, reject) => {
      cos.getBucket(params, (err, result) => { err ? reject(err) : resolve(result) })
    })

    result.Contents.forEach(v => {
      if (v.Key.substr(-1) !== '/') {
        objects.push(Object.assign({Name: v.Key.slice(pflen)}, v))
      }
    })

    params.Marker = result.NextMarker
  } while (result.IsTruncated === 'true')
  return objects
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
