
import { app, BrowserWindow } from 'electron'
import path from 'path'

// Handle Squirrel events for Windows
if (require('electron-squirrel-startup')) {
  app.quit()
}

async function createWindow() {
  console.log('Creating window...')
  console.log('Current working directory:', process.cwd())
  console.log('__dirname:', __dirname)
  
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  mainWindow.webContents.openDevTools()

  const isDev = process.env.NODE_ENV === 'development'
  console.log('Running in:', isDev ? 'development' : 'production')

  if (isDev) {
    console.log('Loading development URL...')
    await mainWindow.loadURL('http://localhost:8080')
  } else {
    // In production, load from the dist directory
    const pathIndex = path.join(process.cwd(), 'dist', 'index.html')
    console.log('Loading production file:', pathIndex)
    await mainWindow.loadFile(pathIndex)
  }

  // Log any loading errors
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load:', errorCode, errorDescription)
    console.error('Current URL:', mainWindow.webContents.getURL())
  })
}

app.whenReady().then(() => {
  console.log('Electron app is ready')
  createWindow().catch(error => {
    console.error('Error creating window:', error)
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow().catch(error => {
        console.error('Error creating window on activate:', error)
      })
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
