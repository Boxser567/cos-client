/**
 * Created by gokuai on 17/6/5.
 */
const CosUtil = require('cos-util')
const _config = {
  AppId: '1253834952',
  SecretId: 'AKIDa4NkxzaV0Ut7Yr4sa6ScbNwMdibHb4A4',
  SecretKey: 'qUwCGAsRq46wZ1HLCrKbhfS8e0A8tUu8'
}
const cosutil = new CosUtil(_config)

export default {
  getService: function (callback) {
    cosutil.cos.getService(function (err, data) {
      if (err) return
      console.log('bucket列表', err || data)
      callback && callback(err || data)
    })
  },
  getBucket: function (params, callback) {
    cosutil.listObject(params).then(function (res) {
            // console.log('文件列表信息', res);
      if (res.objects.length) {      // 文件
        res.objects.forEach(function (item) {
          item.active = false
        })
      }
      if (res.dirs.length) {  // 文件夹
        res.dirs.forEach(function (d) {
          d.active = false
          d.dir = true
        })
      }
      callback && callback(res.dirs.concat(res.objects))
    })
  },
  getBucketACL: function (params, callback) {
    cosutil.cos.getBucketACL(params, function (err, data) {
      callback && callback(err || data)
    })
  },
  putBucket: function (params, callback) {
    cosutil.cos.putBucket(params, function (err, data) {
      console.log('返回数据', err, data)
      callback && callback(err || data)
    })
  },
  headBucket: function (params, callback) {
    cosutil.cos.headBucket(params, function (err, data) {
      callback && callback(err || data)
    })
  },
  deleteBucket: function (params, callback) {
    cosutil.cos.deleteBucket(params, function (err, data) {
      callback && callback(err || data)
    })
  },
  putObject: function (params, callback) {
    cosutil.cos.putObject(params, function (err, data) {
      callback && callback(err || data)
    })
  },
  sliceUploadFile: function (params, callback) {
    cosutil.cos.sliceUploadFile(params, function (err, data) {
      console.log('上传', err, data)
      callback && callback(err || data)
    })
  }
}
