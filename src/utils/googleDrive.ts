
export const loadGoogleAPI = async () => {
  return new Promise((resolve, reject) => {
    if (window.gapi) {
      console.log('Google API already loaded, initializing client...')
      initializeGapiClient(resolve, reject)
      return
    }

    console.log('Loading Google API script...')
    const script = document.createElement('script')
    script.src = 'https://apis.google.com/js/api.js'
    script.onload = () => {
      console.log('Google API script loaded, initializing client...')
      initializeGapiClient(resolve, reject)
    }
    script.onerror = (error) => {
      console.error('Error loading Google API script:', error)
      reject(new Error('Failed to load Google API script'))
    }
    document.body.appendChild(script)
  })
}

const initializeGapiClient = (resolve: (value: any) => void, reject: (reason?: any) => void) => {
  window.gapi.load('client:auth2', async () => {
    try {
      await window.gapi.client.init({
        clientId: import.meta.env.VITE_GOOGLE_DRIVE_CLIENT_ID,
        scope: 'https://www.googleapis.com/auth/drive.file',
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
      })
      console.log('Google API client initialized successfully')
      resolve(window.gapi)
    } catch (error) {
      console.error('Error initializing Google API client:', error)
      reject(error)
    }
  })
}

export const authenticateGoogleDrive = async () => {
  try {
    console.log('Starting Google Drive authentication...')
    const gapi = await loadGoogleAPI()
    
    if (!gapi.auth2) {
      throw new Error('Google Auth2 module not loaded')
    }

    const authInstance = gapi.auth2.getAuthInstance()
    if (!authInstance) {
      throw new Error('Failed to get Google Auth instance')
    }

    if (!authInstance.isSignedIn.get()) {
      console.log('User not signed in, initiating sign in...')
      await authInstance.signIn()
    }
    console.log('User is authenticated with Google Drive')
  } catch (error) {
    console.error('Error authenticating with Google Drive:', error)
    throw error
  }
}

export const uploadToGoogleDrive = async (file: Blob, filename: string, folderId: string) => {
  try {
    console.log(`Uploading file: ${filename} to folder: ${folderId}`)
    
    const metadata = {
      name: filename,
      mimeType: 'application/json',
      parents: [folderId]
    }

    const form = new FormData()
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }))
    form.append('file', file)

    console.log('Creating file in Google Drive...')
    const response = await window.gapi.client.drive.files.create({
      resource: metadata,
      media: {
        mimeType: 'application/json',
        body: file,
      },
    })

    console.log('File uploaded successfully:', response)
    return response
  } catch (error) {
    console.error('Error uploading to Google Drive:', error)
    throw error
  }
}

export const pickBackupFile = async () => {
  console.log('Opening file picker...')
  return new Promise<File | null>((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0] || null
      console.log('File selected:', file?.name)
      resolve(file)
    }
    input.click()
  })
}
