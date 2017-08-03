/**
 *项目/框架无关的工具方法
 */
var Util = {
  //检测某个方法是不是原生的本地方法
  // http://peter.michaux.ca/articles/feature-detection-state-of-the-art-browser-scripting
  isHostMethod: function (object, property) {
    var t = typeof object[property]
    return t == 'function' ||
      (!!(t == 'object' && object[property])) ||
      t == 'unknown'
  },
  getUuid: function () {
    var uuid = ''
    for (var i = 0; i < 32; i++) {
      uuid += Math.floor(Math.random() * 16).toString(16)
    }
    return uuid
  }
}

Util.object = {
  //比较两个对象是否具有相同的属性和相同的属性值
  checkObjEquils: function (obj1, obj2) {
    var objKeys_1 = []
    var objKeys_2 = []
    for (var key_1 in obj1) {
      objKeys_1.push(key_1)
    }
    for (var key_2 in obj2) {
      objKeys_2.push(key_2)
    }
    objKeys_1.sort()
    objKeys_2.sort()
    if (objKeys_1.length != objKeys_2.length) return false
    var eqLen = 0
    for (var i = 0; i < objKeys_1.length; i++) {
      if (objKeys_1[i] == objKeys_2[i]) {
        if (obj1[objKeys_1[i]] == obj2[objKeys_2[i]]) {
          eqLen++
        } else {
          return false
        }
      } else {
        return false
      }
    }
    if (eqLen == objKeys_1.length) return true
    return false
  }
}

Util.String = {
  escapeHtml: function (text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
  },

  getArray: function (str) {
    if (!str) return []
    let arr = str.split('\n')
    let text = []
    arr.forEach((n, i) => {
      if (n !== '') {
        text.push(n)
      }
    })
    return text
  },
  setArray: function (arr) {
    if (arr.constructor !== Array) return ''
    let str = ''
    arr.forEach((n, i) => {
      if (arr.length - 1 === i) {
        str += n
      } else {
        str += n + '\n'
      }
    })
    return str
  },

  getExt: function (filename) {
    filename = String(filename)
    var lastIndex = filename.lastIndexOf('.')
    if (lastIndex < 0) {
      return ''
    }
    return filename.slice(filename.lastIndexOf('.') + 1).toLowerCase()
  },

  baseName: function (path) {
    path = String(path)
    return path.replace(/\\/g, '/').replace(/.*\//, '')
  },

  dirName: function (path) {
    path = String(path)
    return path.indexOf('/') < 0 ? '' : path.replace(/\\/g, '/').replace(/\/[^\/]*$/, '')
  },

  //返回字符串的最后一个字符
  lastChar: function (str) {
    str = String(str)
    return str.charAt(str.length - 1)
  },

  //根据某个分隔符获取分隔符后面的字符
  getNextStr: function (str, separate) {
    return str.slice(str.lastIndexOf(separate) + 1)
  },

  //根据某个分隔符获取分隔符前面面的字符
  getPrevStr: function (str, separate) {
    if (str.indexOf(separate) < 0) {
      return ''
    }
    else {
      return str.slice(0, str.lastIndexOf(separate))
    }
  },

  //获取unicode编码
  getUnicode: function (str) {
    function parseStandard (str) {
      if (str.length == 1) {
        return '000' + str
      } else if (str.length == 2) {
        return '00' + str
      } else if (str.length == 3) {
        return '0' + str
      } else {
        return str
      }
    }

    var t = ''
    for (var i = 0; i < s.length; i++) {
      t += '\\u' + parseStandard(s.charCodeAt(i).toString(16))
    }
    return t
  }
}

Util.RegExp = {
  Name: /^[a-zA-Z0-9_\u4e00-\u9fa5（）().·\-]+$/,
  HTTPALL: /http(s?):\/\/[A-Za-z0-9]+\.[A-Za-z0-9]+[\/=\?%\-&_~`@[\]\’:+!]*([^<>\"\"])*/g,
  HTTP: /^http(s?):\/\/[A-Za-z0-9]+\.[A-Za-z0-9]+[\/=\?%\-&_~`@[\]\’:+!]*([^<>\"\"])*$/,
  Email: /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i,
  NumberandLetter: /^([A-Z]|[a-z]|[\d])*$/,
  PositiveNumber: /^[1-9]\d*$/, //正整数
  NonNegativeNum: /^(0|[1-9]\d*)$/, //非负整数，即0和正整数
  IP: /^((1?\d?\d|(2([0-4]\d|5[0-5])))\.){3}(1?\d?\d|(2([0-4]\d|5[0-5])))$/,
  URL: /^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,6}$/,
  PhoneNumber: /^((0\d{2,3})-)?(\d{7,8})(-(\d{3,}))?$|^(13|15|18)[0-9]{9}$/,
  MobileNumber: /^(0|86|17951)?1\d{10}$/,
  QQ: /^\d{1,10}$/,
  DOMAIN: /^(?=^.{3,255}$)[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+$/,
  Date: /^((?!0000)[0-9]{4}-((0[1-9]|1[0-2])-(0[1-9]|1[0-9]|2[0-8])|(0[13-9]|1[0-2])-(29|30)|(0[13578]|1[02])-31)|([0-9]{2}(0[48]|[2468][048]|[13579][26])|(0[48]|[2468][048]|[13579][26])00)-02-29)$/,
  HTTPStrict: /((http|ftp|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&amp;:/~\+#]*[\w\-\@?^=%&amp;/~\+#])?|www+(\.[\w\-_]+)+([\w\-\.,@?^=%&amp;:/~\+#]*[\w\-\@?^=%&amp;/~\+#])?)/gi,
  POUND_TOPIC: /^#([^\/|\\|\:|\*|\?|\"|<|>|\|]+?)#/,
  AT: /(@[a-zA-Z0-9_\u4e00-\u9fa5（）()]+)(\W|$)/gi,
  NewAT: /(@\u0002.+?)(\u0001)/gi,//stx+soh修复@人名有空格无效
  ATTRANS: /\[@ id=(\d+|all)\](@(\w|\s|[\u4e00-\u9fa5])+)\[\/@\]/g,//@返回的转义内容
  URLTRANS: /\[url=(.+)\](.+)\[\/url\]/g,
  IMGTRANS: /\[img\](.+)\[\/img\]/g,
  MessageHTTPStrict: /([^"']|^)(((http|ftp|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&amp;:/~\+#]*[\w\-\@?^=%&amp;/~\+#])?|www+(\.[\w\-_]+)+([\w\-\.,@?^=%&amp;:/~\+#]*[\w\-\@?^=%&amp;/~\+#])?))/gi,
}

Util.Validation = {
  isRegName: function (name) {
    return Util.RegExp.Name.test(name)
  },
  isHttp: function (str) {
    return Util.RegExp.HTTP.test(str)
  },
  isEmail: function (str) {
    return Util.RegExp.Email.test(str)
  },
  //是否为非负整数
  isNonNegativeNum: function (str) {
    return Util.RegExp.NonNegativeNum.test(str)
  },
  //是否为正整数
  isPositiveNumber: function (str) {
    return Util.RegExp.PositiveNumber.test(str)
  },
  isPhoneNum: function (str) {
    return Util.RegExp.PhoneNumber.test(str)
  },
  isQQNum: function (str) {
    return Util.RegExp.QQ.test(str)
  },
  isDomain: function (str) {
    return Util.RegExp.DOMAIN.test(str)
  },
  isDate: function (str) {
    return Util.RegExp.Date.test(str)
  },
  isMobileNum: function (str) {
    return Util.RegExp.MobileNumber.test(str)
  }
}

Util.Date = {
  format: function (date, format) {
    var o = {
      'M+': date.getMonth() + 1, //month
      'd+': date.getDate(), //day
      'h+': date.getHours(), //hour
      'm+': date.getMinutes(), //minute
      's+': date.getSeconds(), //second

      'q+': Math.floor((date.getMonth() + 3) / 3), //quarter
      'S': date.getMilliseconds() //millisecond
    }
    if (/(y+)/.test(format)) {
      format = format.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
    }
    for (var k in o) {
      if (new RegExp('(' + k + ')').test(format)) {
        format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length))
      }
    }
    return format
  }
}

Util.Number = {
  bitSize: function (num, decimal) {
    if (typeof(num) != 'number') {
      num = Number(num)
    }
    if (typeof(decimal) != 'number') {
      decimal = 2
    }
    if (num < 0) {
      return ''
    }
    var type = new Array('B', 'KB', 'MB', 'GB', 'TB', 'PB')
    var j = 0
    while (num >= 1024) {
      if (j >= 5)
        return num + type[j]
      num = num / 1024
      j++
    }
    if (num == 0) {
      return num + 'B'
    } else {
      var dec = 1
      for (var i = 0; i < decimal; i++) {
        dec = dec * 10
      }
      return Math.round(num * dec) / dec + type[j]
    }
  }
}

Util.Array = {
  getObjectByKeyValue: function (array, key, value) {
    var obj = null,
      len = array.length
    for (var i = 0; i < len; i++) {
      if (array[i] !== undefined && typeof array[i][key] !== 'undefined' && array[i][key] == value) {
        obj = array[i]
        break
      }
    }
    return obj
  },
  removeByValue: function (array, value) {
    var len = array.length
    for (var i = 0; i < len; i++) {
      if (array[i] == value) {
        array.splice(i, 1)
        break
      }
    }
    return array
  },

  remove: function (array, removeItems) {
    for (var i = 0; i < removeItems.length; i++) {
      var index = array.indexOf(removeItems[i])
      if (index < 0) {
        break
      }
      array.splice(index, 1)
    }
  },

  unique: function (arr) {
    var newArray = []
    var provisionalTable = {}
    for (var i = 0, item; (item = arr[i]) != null; i++) {
      if (!provisionalTable[item]) {
        newArray.push(item)
        provisionalTable[item] = true
      }
    }
    return newArray
  }
}

export default Util
