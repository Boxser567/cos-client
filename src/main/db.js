/**
 * Created by michael on 2017/7/6.
 */
import sqlite3 from 'sqlite3'
let db = new (sqlite3.verbose()).Database('gk.sqlite')

async function config () {
  await new Promise((resolve, reject) => {
    let sqlConfig = `CREATE TABLE IF NOT EXISTS config (
  key   VARCHAR PRIMARY KEY NOT NULL,
  value VARCHAR )`
    db.run(sqlConfig, (err) => {
      err ? reject(err) : resolve()
    })
  })
  return new Promise((resolve, reject) => {
    db.all('SELECT key, value FROM config', (err, rows) => {
      if (err) {
        reject(err)
        return
      }
      let config = {}
      for (let item of rows) {
        config[item.key] = item.value
      }
      resolve(config)
    })
  })
}

async function upload () {
  await new Promise((resolve, reject) => {
    let sqlUpload = `CREATE TABLE IF NOT EXISTS upload (
    id INT PRIMARY KEY,
    value VARCHAR )`
    db.run(sqlUpload, (err) => {
      err ? reject(err) : resolve()
    })
  })

  return new Promise((resolve, reject) => {
    db.all('SELECT id, value FROM upload', (err, rows) => {
      if (err) {
        reject(err)
        return
      }
      let arr = []
      for (let row of rows) {
        arr.push(JSON.parse(row.value))
      }
      resolve(arr)
    })
  })
}

async function download () {
  await new Promise((resolve, reject) => {
    let sqlDownload = `CREATE TABLE IF NOT EXISTS download (
    id INT PRIMARY KEY,
    value VARCHAR )`
    db.run(sqlDownload, (err) => {
      err ? reject(err) : resolve()
    })
  })

  return new Promise((resolve, reject) => {
    db.all('SELECT id, value FROM download', (err, rows) => {
      if (err) {
        reject(err)
        return
      }
      let arr = []
      for (let row of rows) {
        arr.push(JSON.parse(row.value))
      }
      resolve(arr)
    })
  })
}

let initData = Promise.all([config(), upload(), download()])
  .then((data) => {
    return Promise.resolve({
      config: data[0],
      upload: data[1],
      download: data[2]
    })
  })

async function updateUploads (tasks) {
  db.run('')
  let stmt = db.prepare('INSERT INTO lorem VALUES (?)')

}

function updateDownloads (tasks) {

}

export {initData, db}
// let stmt = db.prepare('INSERT INTO lorem VALUES (?)')
// for (let i = 0; i < 10; i++) {
//   stmt.run('Ipsum ' + i)
// }
// stmt.finalize()
//
// db.each('SELECT rowid AS id, info FROM lorem', function (err, row) {
//   console.log(row.id + ': ' + row.info)
// })

// db.close()

// function promiseful (fn, self, arg) {
//   return function () {
//     return new Promise((resolve, reject) => {
//       fn.call(self, arg, (err, result) => {
//         err ? reject(err) : resolve(result)
//       })
//     })
//   }
// }
