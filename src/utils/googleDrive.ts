export const loadGoogleAPI = async () => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://apis.google.com/js/api.js'
    script.onload = () => {
      window.gapi.load('client:auth2', async () => {
        try {
          await window.gapi.client.init({
            clientId: import.meta.env.VITE_GOOGLE_DRIVE_CLIENT_ID,
            scope: 'https://www.googleapis.com/auth/drive.file',
          })
          resolve(window.gapi)
        } catch (error) {
          reject(error)
        }
      })
    }
    script.onerror = reject
    document.body.appendChild(script)
  })
}

export const authenticateGoogleDrive = async () => {
  if (!window.gapi.auth2.getAuthInstance().isSignedIn.get()) {
    await window.gapi.auth2.getAuthInstance().signIn()
  }
}

export const uploadToGoogleDrive = async (file: Blob, filename: string, folderId: string) => {
  const metadata = {
    name: filename,
    mimeType: 'application/json',
    parents: [folderId]
  }
  
  const form = new FormData()
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }))
  form.append('file', file)
  
  await window.gapi.client.drive.files.create({
    resource: metadata,
    media: {
      mimeType: 'application/json',
      body: file,
    },
  })
}

export const pickBackupFile = async () => {
  return new Promise<File | null>((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0] || null
      resolve(file)
    }
    input.click()
  })
}