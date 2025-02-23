
import { app, BrowserWindow } from 'electron'
import path from 'path'

// Handle creating/removing shortcuts on Windows when installing/uninstalling
if (require('electron-squirrel-startup')) {
  app.quit()
}

async function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false // Allow loading local files in production
    }
  })

  if (process.env.NODE_ENV === 'development') {
    console.log('Loading development URL...')
    try {
      await mainWindow.loadURL('http://localhost:8080')
      mainWindow.webContents.openDevTools()
    } catch (error) {
      console.error('Failed to load development URL:', error)
    }
  } else {
    console.log('Loading production build...')
    // In production, load from the dist directory
    const indexPath = path.join(__dirname, '..', 'dist', 'index.html')
    console.log('Loading from:', indexPath)
    try {
      await mainWindow.loadFile(indexPath)
    } catch (error) {
      console.error('Failed to load production build:', error)
    }
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
