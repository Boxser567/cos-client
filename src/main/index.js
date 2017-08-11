'use strict'

import { app, BrowserWindow, Menu, shell } from 'electron'
import Main from './main'
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
    height: 660,
    minHeight: 660,
    useContentSize: true,
    width: 1000,
    minWidth: 1000,
    title: 'COS',
    frame: false
  })

  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null
    main.close().then(() => {
      if (process.platform !== 'darwin') {
        app.quit()
      }
    })
  })
}

function buildApplicationMenu () {
  if (process.platform === 'darwin') {
    let template = [
      {
        label: app.getName(),
        submenu: [
          {role: 'about'},
          {type: 'separator'},
          {role: 'services', submenu: []},
          {type: 'separator'},
          {role: 'hide'},
          {role: 'hideothers'},
          {role: 'unhide'},
          {type: 'separator'},
          {role: 'quit'}
        ]
      },
      {
        label: 'Edit',
        submenu: [
          {role: 'undo'},
          {role: 'redo'},
          {type: 'separator'},
          {role: 'cut'},
          {role: 'copy'},
          {role: 'paste'},
          {role: 'pasteandmatchstyle'},
          {role: 'delete'},
          {role: 'selectall'},
          {type: 'separator'},
          {
            label: 'Speech',
            submenu: [
              {role: 'startspeaking'},
              {role: 'stopspeaking'}
            ]
          }
        ]
      },
      {
        role: 'window',
        submenu: [
          {role: 'close'},
          {role: 'minimize'},
          {role: 'zoom'},
          {type: 'separator'},
          {role: 'front'}
        ]
      },
      {
        role: 'help',
        submenu: [
          {
            label: 'More',
            click () { shell.openExternal('https://www.qcloud.com/document/product/436') }
          }
        ]
      }
    ]
    let menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)
  } else {
    Menu.setApplicationMenu(null)
  }
}

const shouldQuit = app.makeSingleInstance(() => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore()
    mainWindow.focus()
  }
})

if (shouldQuit) {
  app.quit()
}

app.on('ready', () => {
  buildApplicationMenu()
  createWindow()
})

// 仅用于保证mac下不会直接退出。
app.on('window-all-closed', () => {})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

let main = new Main()
