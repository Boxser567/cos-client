'use strict'

import { app, BrowserWindow ,Tray} from 'electron'
import { App } from './app'
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
  let app = new App()
  /**
   * Initial window options
   */
  // const appIcon = new Tray('/Users/somebody/images/icon.png')
  // let win = new BrowserWindow({icon: '/Users/somebody/images/window.png'})
  // console.log(appIcon, win)

  mainWindow = new BrowserWindow({
    height: 540,
    minHeight: 540,
    useContentSize: true,
    width: 900,
    minWidth: 900,
  })

  mainWindow.loadURL(winURL)
  console.debug(__dirname,'this-static', __static)


  mainWindow.on('closed', () => {
    mainWindow = null
    app.close()
  })
}

app.on('ready', () => {
  createWindow()

})

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
