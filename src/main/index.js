'use strict'

import { app, BrowserWindow } from 'electron'

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 563,
    useContentSize: true,
    width: 1000
  })

  mainWindow.loadURL(winURL)

  mainWindow.webContents.session.on('will-download', (event, item, webContents) => {
    // item.setSavePath()

    // item.on('updated', (event, state) => {
    //   if (state === 'interrupted') {
    //     console.log('Download is interrupted but can be resumed')
    //   } else if (state === 'progressing') {
    //     if (item.isPaused()) {
    //       console.log('Download is paused')
    //     } else {
    //       console.log(`Received bytes: ${item.getReceivedBytes()}`)
    //     }
    //   }
    // })
    //
    // item.once('done', (event, state) => {
    //   if (state === 'completed') {
    //     console.log('Download successfully')
    //   } else {
    //     console.log(`Download failed: ${state}`)
    //   }
    // })

    // event.preventDefault()
    // require('request')(item.getURL(), (data) => {
    //   require('fs').writeFileSync('/somewhere', data)
    // })
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})
