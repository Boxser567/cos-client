/**
 * Created by michael on 2017/7/18.
 */
import Cos from 'cos-nodejs-sdk-v5'
export let cos = new Cos({})

function putBucket (params) {
  return new Promise((resolve, reject) => {
    cos.putBucket(params, (err, data) => {
      if (err) {
        reject(err)
        return
      }
      resolve(data)
    })
  })
}

function headBucket (params) {
  return new Promise((resolve, reject) => {
    cos.headBucket(params, (err, data) => {
      if (err) {
        reject(err)
        return
      }
      resolve(data)
    })
  })
}

function getObjectUrl (params) {
  return `${params.Bucket}-${cos.options.AppId}.${params.Region}.myqcloud.com/${params.Key}?authorization=${cos.getAuth(params)}`
}

export { putBucket, headBucket, getObjectUrl }
