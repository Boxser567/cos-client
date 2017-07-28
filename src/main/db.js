/**
 * Created by michael on 2017/7/6.
 */
import sqlite3 from 'sqlite3'
import { app } from 'electron'
import fs from 'fs'
import path from 'path'

function DB () {
  let userDir = app.getPath('userData')
  let dbname = 'gk.sqlite'
  if (process.env.NODE_ENV !== 'development') {
    dbname = path.join(userDir, 'db.dat')
    try {
      fs.mkdirSync(userDir)
    } catch (e) {}
  }
  this.db = new (sqlite3.verbose()).Database(dbname)
}

DB.prototype.config = function () {
  let get = async () => {
    await new Promise((resolve, reject) => {
      let sqlConfig = `CREATE TABLE IF NOT EXISTS config (
  key   VARCHAR PRIMARY KEY NOT NULL,
  value VARCHAR )`
      this.db.run(sqlConfig, (err) => {
        err ? reject(err) : resolve()
      })
    })
    return new Promise((resolve, reject) => {
      this.db.all('SELECT key, value FROM config', (err, rows) => {
        if (err) {
          reject(err)
          return
        }
        let config = {}
        for (let item of rows) {
          config[item.key] = JSON.parse(item.value)
        }
        resolve(config)
      })
    })
  }

  let set = async (config) => {
    await new Promise((resolve, reject) => {
      this.db.run(`DELETE FROM config`, (err) => {
        err ? reject(err) : resolve()
      })
    })
    let values = []
    for (let k in config) {
      if (!config.hasOwnProperty(k) || !config[k]) continue
      let j = JSON.stringify(config[k])
      values.push(`('${k}','${j}')`)
    }
    if (values.length === 0) return Promise.resolve()
    return new Promise((resolve, reject) => {
      this.db.run(`INSERT INTO config VALUES ${values.join(',')}`, [], resolve)
    })
  }

  return {get, set}
}

DB.prototype.upload = function () {
  let get = async () => {
    await new Promise((resolve, reject) => {
      let sqlUpload = `CREATE TABLE IF NOT EXISTS upload (
    id INT PRIMARY KEY,
    value VARCHAR )`
      this.db.run(sqlUpload, (err) => {
        err ? reject(err) : resolve()
      })
    })

    return new Promise((resolve, reject) => {
      this.db.all('SELECT id, value FROM upload', (err, rows) => {
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

  let set = async (tasks) => {
    await new Promise((resolve, reject) => {
      this.db.run(`DELETE FROM upload`, (err) => {
        err ? reject(err) : resolve()
      })
    })
    let values = []
    for (let t of tasks) {
      if (!t) continue
      let j = JSON.stringify({
        params: t.params,
        name: t.file.fileName,
        status: t.status,
        total: t.progress.total,
        loaded: t.progress.loaded,
        option: {
          asyncLim: t.asyncLim,
          sliceSize: t.file.sliceSize
        }
      })
      values.push(`(${t.id},'${j}')`)
    }
    if (values.length === 0) return Promise.resolve()
    return new Promise((resolve, reject) => {
      this.db.run(`INSERT INTO upload VALUES ${values.join(',')}`, [], resolve)
    })
  }

  return {get, set}
}

DB.prototype.download = function () {
  let get = async () => {
    await new Promise((resolve, reject) => {
      let sqlDownload = `CREATE TABLE IF NOT EXISTS download (
    id INT PRIMARY KEY,
    value VARCHAR )`
      this.db.run(sqlDownload, (err) => {
        err ? reject(err) : resolve()
      })
    })

    return new Promise((resolve, reject) => {
      this.db.all('SELECT id, value FROM download', (err, rows) => {
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

  let set = async (tasks) => {
    await new Promise((resolve, reject) => {
      this.db.run(`DELETE FROM download`, (err) => {
        err ? reject(err) : resolve()
      })
    })
    let values = []
    for (let t of tasks) {
      if (!t) continue
      let j = JSON.stringify({
        params: t.params,
        name: t.file.fileName,
        status: t.status,
        total: t.progress.total,
        loaded: t.progress.loaded
      })
      values.push(`(${t.id},'${j}')`)
    }

    if (values.length === 0) return Promise.resolve()
    return new Promise((resolve, reject) => {
      this.db.run(`INSERT INTO download VALUES ${values.join(',')}`, [], resolve)
    })
  }

  return {get, set}
}

DB.prototype.clear = function () {
  this.db.run(`DELETE FROM config`)
  this.db.run(`DELETE FROM download`)
  this.db.run(`DELETE FROM upload`)
}

export default DB
