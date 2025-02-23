
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

  // Determine the correct path for production
  const isDev = process.env.NODE_ENV === 'development'
  console.log('Running in:', isDev ? 'development' : 'production')
  console.log('Current directory:', __dirname)

  if (isDev) {
    console.log('Loading development URL...')
    try {
      await mainWindow.loadURL('http://localhost:8080')
      mainWindow.webContents.openDevTools()
    } catch (error) {
      console.error('Failed to load development URL:', error)
    }
  } else {
    // In production, load using file protocol
    try {
      const indexPath = path.join(__dirname, '..', 'dist', 'index.html')
      console.log('Attempting to load file:', indexPath)
      
      const fileUrl = new URL(`file://${indexPath}`).href
      console.log('Loading URL:', fileUrl)
      
      await mainWindow.loadURL(fileUrl)
    } catch (error) {
      console.error('Failed to load production build:', error)
      console.error('Error details:', error.message)
      
      // Try alternative path as fallback
      try {
        const altPath = path.join(process.resourcesPath, 'dist', 'index.html')
        console.log('Trying alternative path:', altPath)
        const altUrl = new URL(`file://${altPath}`).href
        await mainWindow.loadURL(altUrl)
      } catch (altError) {
        console.error('Alternative path also failed:', altError.message)
      }
    }
  }

  // Error handling with more details
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('Failed to load:', {
      errorCode,
      errorDescription,
      validatedURL
    })
  })

  // Handle window state
  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })
}

// Add error handling for the app
app.on('render-process-gone', (event, webContents, details) => {
  console.error('Render process gone:', details)
})

app.on('child-process-gone', (event, details) => {
  console.error('Child process gone:', details)
})

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
