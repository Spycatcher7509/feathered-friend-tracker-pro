
import { app, BrowserWindow } from 'electron'
import path from 'path'

// Handle Squirrel events for Windows
if (require('electron-squirrel-startup')) {
  app.quit()
}

function createWindow() {
  console.log('Creating window...')
  
  // Create the browser window
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  // Open the DevTools automatically
  mainWindow.webContents.openDevTools()

  // Log the current environment
  console.log('Current NODE_ENV:', process.env.NODE_ENV)

  if (process.env.NODE_ENV === 'development') {
    console.log('Loading development URL...')
    // In development, load from Vite dev server
    mainWindow.loadURL('http://localhost:8080')
  } else {
    console.log('Loading production build...')
    // In production, load the built files
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  // Log loading errors
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load:', errorCode, errorDescription)
    
    // Retry loading in development mode after a short delay
    if (process.env.NODE_ENV === 'development') {
      console.log('Retrying development server connection...')
      setTimeout(() => {
        mainWindow.loadURL('http://localhost:8080')
      }, 1000)
    }
  })
}

// Create window when Electron is ready
app.whenReady().then(() => {
  console.log('Electron app is ready')
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
