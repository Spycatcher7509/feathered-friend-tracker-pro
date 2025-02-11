
import { supabase } from "@/integrations/supabase/client"

const getGoogleDriveClientId = async (): Promise<string> => {
  const { data, error } = await supabase
    .from('google_drive_config')
    .select('client_id')
    .single()

  if (error) {
    console.error('Error fetching Google Drive client ID:', error)
    throw new Error('Failed to fetch Google Drive client ID')
  }

  if (!data?.client_id) {
    throw new Error('Google Drive client ID not configured')
  }

  return data.client_id
}

export const loadGoogleAPI = async () => {
  return new Promise<typeof window.gapi>((resolve, reject) => {
    if (window.gapi) {
      console.log('Google API already loaded, initializing client...')
      initializeGapiClient(resolve, reject)
      return
    }

    console.log('Loading Google API script...')
    const script = document.createElement('script')
    script.src = 'https://apis.google.com/js/api.js'
    script.crossOrigin = "anonymous"
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

const initializeGapiClient = async (resolve: (value: typeof window.gapi) => void, reject: (reason?: any) => void) => {
  try {
    const clientId = await getGoogleDriveClientId()
    console.log('Initializing Google API client...')
    
    window.gapi.load('client:auth2', async () => {
      try {
        console.log('Initializing Google API client with client ID:', clientId)
        
        await window.gapi.client.init({
          clientId: clientId,
          scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.profile',
          discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest']
        })

        const auth2Promise = new Promise<void>((resolve) => {
          window.gapi.auth2.init({
            client_id: clientId,
            scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.profile',
            cookie_policy: 'single_host_origin'
          }).then(() => resolve())
        })

        await auth2Promise
        
        console.log('Google API client and auth2 initialized successfully')
        resolve(window.gapi)
      } catch (error) {
        const errorDetails = error instanceof Error ? error.message : JSON.stringify(error)
        console.error('Error initializing Google API client:', errorDetails)
        reject(new Error(`Failed to initialize Google API client: ${errorDetails}`))
      }
    })
  } catch (error) {
    console.error('Error getting Google Drive client ID:', error)
    reject(error)
  }
}

export const authenticateGoogleDrive = async () => {
  try {
    console.log('Starting Google Drive authentication...')
    const gapi = await loadGoogleAPI()
    
    if (!gapi.auth2) {
      console.error('Google Auth2 module not loaded')
      throw new Error('Google Auth2 module not loaded')
    }

    const authInstance = gapi.auth2.getAuthInstance()
    if (!authInstance) {
      console.error('Failed to get Google Auth instance - make sure client ID is correct')
      throw new Error('Failed to get Google Auth instance')
    }

    console.log('Auth instance retrieved, checking if user is signed in...')
    if (!authInstance.isSignedIn.get()) {
      console.log('User not signed in, initiating sign in...')
      await authInstance.signIn()
    }

    const currentUser = authInstance.currentUser.get()
    const userProfile = currentUser.getBasicProfile()
    console.log('User authenticated:', userProfile.getName())
    console.log('User is authenticated with Google Drive')
  } catch (error) {
    const errorDetails = error instanceof Error ? error.message : JSON.stringify(error)
    console.error('Error authenticating with Google Drive:', errorDetails)
    throw new Error(`Authentication failed: ${errorDetails}`)
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
