/**
 * Created by michael on 2017/6/29.
 */
import { ipcMain } from 'electron'
import Cos from 'cos-util'

export default function () {
  let cos = new Cos({
    AppId: '1253834952',
    SecretId: 'AKIDa4NkxzaV0Ut7Yr4sa6ScbNwMdibHb4A4',
    SecretKey: 'qUwCGAsRq46wZ1HLCrKbhfS8e0A8tUu8'
  })

  ipcMain.on('GetBucket', (event, arg) => {
    cos.cos.getService((err, data) => {
      if (err) {
        event.sender.send('GetBucket-error', err)
      }
      let returnValue = []
      data.Buckets.forEach((v) => {
        v.Name = v.Name.split('-')[0]
        returnValue.push(v)
      })
      event.sender.send('GetBucket-data', returnValue)
    })
  })

  ipcMain.on('PutBucket', (event, arg) => {
    cos.cos.getService((err, data) => {
      if (err) {
        event.sender.send('PutBucket-error', err)
      }
      let returnValue = []
      data.Buckets.forEach((v) => {
        v.Name = v.Name.split('-')[0]
        returnValue.push(v)
      })
      event.sender.send('PutBucket-data', returnValue)
    })
  })
}
