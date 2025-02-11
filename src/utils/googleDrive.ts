
import { supabase } from "@/integrations/supabase/client"
import { JWT } from 'google-auth-library'

export const initializeGoogleDrive = async () => {
  try {
    console.log('Fetching Google Drive service account credentials...')
    const { data: credentials, error } = await supabase
      .from('google_drive_service_account')
      .select('*')
      .single()

    if (error || !credentials) {
      console.error('Error fetching Google Drive credentials:', error)
      throw new Error('Failed to fetch Google Drive credentials')
    }

    const auth = new JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: ['https://www.googleapis.com/auth/drive.file'],
      // Simplify configuration for browser environment
      subject: null,
      keyId: null,
      // Set required properties for browser environment
      projectId: credentials.project_id,
      additionalClaims: {
        target_audience: window.location.origin
      }
    })

    // Force token refresh
    const token = await auth.authorize()
    if (!token) {
      throw new Error('Failed to get access token')
    }

    return auth
  } catch (error) {
    console.error('Error initializing Google Drive:', error)
    throw error
  }
}

export const uploadToGoogleDrive = async (file: Blob, filename: string, folderId: string) => {
  try {
    console.log(`Uploading file: ${filename} to folder: ${folderId}`)
    
    const auth = await initializeGoogleDrive()
    const accessToken = await auth.getAccessToken()
    
    if (!accessToken || !accessToken.token) {
      throw new Error('No access token available')
    }

    const metadata = {
      name: filename,
      parents: [folderId],
      mimeType: 'application/json'
    }

    const form = new FormData()
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }))
    form.append('file', file)

    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken.token}`,
      },
      body: form
    })

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`)
    }

    const result = await response.json()
    console.log('File uploaded successfully:', result)
    return result
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
