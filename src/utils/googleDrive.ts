
export const loadGoogleAPI = async () => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://apis.google.com/js/api.js'
    script.onload = () => {
      window.gapi.load('client:auth2', async () => {
        try {
          await window.gapi.client.init({
            apiKey: null, // We don't need an API key for this use case
            clientId: import.meta.env.VITE_GOOGLE_DRIVE_CLIENT_ID,
            discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
            scope: 'https://www.googleapis.com/auth/drive.file',
          })
          resolve(window.gapi)
        } catch (error) {
          console.error('Error initializing Google API client:', error)
          reject(error)
        }
      })
    }
    script.onerror = (error) => {
      console.error('Error loading Google API script:', error)
      reject(error)
    }
    document.body.appendChild(script)
  })
}

export const authenticateGoogleDrive = async () => {
  try {
    if (!window.gapi?.auth2?.getAuthInstance()) {
      console.error('Google Auth not initialized')
      throw new Error('Google Auth not initialized')
    }

    const authInstance = window.gapi.auth2.getAuthInstance()
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
