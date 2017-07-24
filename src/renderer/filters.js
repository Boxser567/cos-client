function getDate (time) {
  if (!time) return '-'
  let timeStan = (new Date(time)).valueOf()
  let dt = new Date(timeStan)
  let Y = dt.getFullYear() + '-'
  let M = (dt.getMonth() + 1 < 10 ? '0' + (dt.getMonth() + 1) : dt.getMonth() + 1) + '-'
  let D = dt.getDate() + ' '
  let h = dt.getHours() + ':'
  let m = dt.getMinutes() + ':'
  let s = dt.getSeconds()
  return Y + M + D + h + m + s
}

function bitSize (num, decimal) {
  if (!num) {
    return '-'
  }
  if (typeof (num) !== 'number') {
    num = Number(num)
  }
  if (typeof (decimal) !== 'number') {
    decimal = 2
  }
  if (num < 0) {
    return ''
  }
  if (num === 0) {
    return '-'
  }
  let type = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
  let j = 0
  while (num >= 1024) {
    if (j >= 5) { return num + type[j] }
    num = num / 1024
    j++
  }
  if (num === 0) {
    return num + 'B'
  } else {
    let dec = 1
    for (let i = 0; i < decimal; i++) {
      dec = dec * 10
    }
    return Math.round(num * dec) / dec + type[j]
  }
}

function bitSpeed (num, decimal) {
  if (!num) {
    return '-'
  }
  if (typeof (num) !== 'number') {
    num = Number(num)
  }
  if (typeof (decimal) !== 'number') {
    decimal = 2
  }
  if (num < 0) {
    return ''
  }
  if (num === 0) {
    return '-'
  }
  let type = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
  let j = 0
  while (num >= 1024) {
    if (j >= 5) { return num + type[j] }
    num = num / 1024
    j++
  }
  if (num === 0) {
    return num + 'B'
  } else {
    let dec = 1
    for (let i = 0; i < decimal; i++) {
      dec = dec * 10
    }
    return Math.round(num * dec) / dec + type[j] + ' /s'
  }
}

function getInteger (num) {
  if (!Number(num)) return 0
  return Math.floor(num)
}

const FILE_SORTS = {
  'SORT_SPEC': ['doc', 'docx', 'xls', 'xlsx', 'xlsm', 'ppt', 'pptx', 'pdf', 'ai', 'cdr', 'psd', 'dmg', 'iso', 'md', 'ipa', 'apk', 'gknote', 'lkt'],
  'SORT_MOVIE': ['mp4', 'mkv', 'rm', 'rmvb', 'avi', '3gp', 'flv', 'wmv', 'asf', 'mpeg', 'mpg', 'mov', 'ts', 'm4v'],
  'SORT_MUSIC': ['mp3', 'wma', 'wav', 'flac', 'ape', 'ogg', 'aac', 'm4a'],
  'SORT_IMAGE': ['jpg', 'png', 'jpeg', 'gif', 'psd', 'bmp', 'ai', 'cdr'],
  'SORT_DOCUMENT': ['doc', 'docx', 'xls', 'xlsx', 'xlsm', 'ppt', 'pptx', 'pdf', 'odt', 'rtf', 'ods', 'csv', 'odp', 'txt', 'gknote'],
  'SORT_EXE': ['js', 'c', 'cpp', 'h', 'cs', 'vb', 'vbs', 'java', 'sql', 'ruby', 'php', 'asp', 'aspx', 'html', 'htm', 'py', 'jsp', 'pl', 'rb', 'm', 'css', 'go', 'xml', 'erl', 'lua', 'md'],
  'SORT_ZIP': ['rar', 'zip', '7z', 'cab', 'tar', 'gz', 'iso']
}

function getFileImg (name) {
  if (!name) return
  let suffix = ''
  const filename = name.lastIndexOf('.')
  if (filename < 0) {
    suffix = 'folder'
  } else {
    let bucket = name.slice(name.lastIndexOf('.') + 1).toLowerCase()
    for (let key in FILE_SORTS) {
      if (FILE_SORTS[key].indexOf(bucket) > -1) {
        if (key === 'SORT_SPEC') suffix = bucket
        if (key === 'SORT_MOVIE') suffix = 'movie'
        if (key === 'SORT_MUSIC') suffix = 'music'
        if (key === 'SORT_IMAGE') suffix = 'image'
        if (key === 'SORT_DOCUMENT') suffix = 'document'
        if (key === 'SORT_ZIP') suffix = 'compress'
        if (key === 'SORT_EXE') suffix = 'other'
        break
      }
    }
    if (suffix === '') {
      suffix = 'other'
    }
  }
  suffix = './static/images/file-icon/' + suffix + '64x64.png'
  return suffix
}

function getDirName (name) {
  if (!name) return
  return name.replace('/', '')
}

// {
//     value: "cn-south",
//         label: ''
// }, {
//     value: "cn-north",
//         label: ''
// }, {
//     value: "cn-",
//         label: ''
// }, {
//     value: "cn-",
//         label: ''
// }

function getArea (i) {
  switch (i) {
    case 'cn-south':
      return '华南'
    case 'cn-north':
      return '华北'
    case 'cn-east':
      return '华东'
    case 'cn-southwest':
      return '西南'
    default :
      return ''
  }
}

export default {
  getDate: getDate,
  bitSize: bitSize,
  bitSpeed: bitSpeed,
  getFileImg: getFileImg,
  getDirName: getDirName,
  getArea: getArea,
  getInteger: getInteger
}
