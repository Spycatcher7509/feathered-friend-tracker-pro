
import { app, BrowserWindow } from 'electron'
import path from 'path'
import { AddressInfo } from 'net'
import http from 'http'

// Handle creating/removing shortcuts on Windows when installing/uninstalling
if (require('electron-squirrel-startup')) {
  app.quit()
}

function waitForServer(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const maxAttempts = 30
    let attempts = 0

    const checkServer = () => {
      attempts++
      http.get(url, (res) => {
        if (res.statusCode === 200) {
          resolve()
        } else if (attempts < maxAttempts) {
          setTimeout(checkServer, 1000)
        } else {
          reject(new Error('Server not ready after maximum attempts'))
        }
      }).on('error', () => {
        if (attempts < maxAttempts) {
          setTimeout(checkServer, 1000)
        } else {
          reject(new Error('Server not ready after maximum attempts'))
        }
      })
    }

    checkServer()
  })
}

async function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  if (process.env.NODE_ENV === 'development') {
    console.log('Waiting for development server...')
    try {
      await waitForServer('http://localhost:8080')
      console.log('Development server is ready')
      await mainWindow.loadURL('http://localhost:8080')
      mainWindow.webContents.openDevTools()
    } catch (error) {
      console.error('Failed to connect to development server:', error)
    }
  } else {
    console.log('Loading production build...')
    await mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  // Error handling
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load:', errorCode, errorDescription)
  })

  // Handle window state
  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
