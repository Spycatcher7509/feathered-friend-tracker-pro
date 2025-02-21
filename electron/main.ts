
import { app, BrowserWindow } from 'electron'
import path from 'path'
import { net } from 'electron'

// Handle Squirrel events for Windows
if (require('electron-squirrel-startup')) {
  app.quit()
}

const waitForViteServer = async () => {
  return new Promise((resolve) => {
    const checkServer = () => {
      const request = net.request('http://localhost:8080')
      request.on('response', (response) => {
        resolve(true)
      })
      request.on('error', () => {
        console.log('Vite server not ready, retrying in 1s...')
        setTimeout(checkServer, 1000)
      })
      request.end()
    }
    checkServer()
  })
}

async function createWindow() {
  console.log('Creating window...')
  
  if (process.env.NODE_ENV === 'development') {
    console.log('Waiting for Vite dev server...')
    await waitForViteServer()
    console.log('Vite server is ready')
  }
  
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  mainWindow.webContents.openDevTools()

  console.log('Current NODE_ENV:', process.env.NODE_ENV)

  if (process.env.NODE_ENV === 'development') {
    console.log('Loading development URL...')
    mainWindow.loadURL('http://localhost:8080')
  } else {
    console.log('Loading production build...')
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load:', errorCode, errorDescription)
  })
}

app.whenReady().then(() => {
  console.log('Electron app is ready')
  createWindow().catch(console.error)

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow().catch(console.error)
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
