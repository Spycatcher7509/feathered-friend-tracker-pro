
import { app, BrowserWindow } from 'electron'
import path from 'path'

if (require('electron-squirrel-startup')) {
  app.quit()
}

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false // Allow loading local resources
    }
  })

  // In development, we want to load from the dev server
  if (process.env.NODE_ENV === 'development') {
    // Wait for dev server to start
    setTimeout(() => {
      mainWindow.loadURL('http://localhost:8080')
      mainWindow.webContents.openDevTools() // Open DevTools for debugging
      console.log('Loading development URL...')
    }, 2000) // Give the dev server time to start
  } else {
    // In production, load the bundled file
    const indexPath = path.join(__dirname, '../dist/index.html')
    console.log('Loading production path:', indexPath)
    mainWindow.loadFile(indexPath)
  }

  // Log any loading errors
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load:', errorCode, errorDescription)
  })
}

app.whenReady().then(() => {
  createWindow()
  
  // For macOS: re-create window when dock icon is clicked
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
