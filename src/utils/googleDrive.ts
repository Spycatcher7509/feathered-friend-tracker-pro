
import { supabase } from "@/integrations/supabase/client"

const generateJWT = async (header: string, claims: any, key: string) => {
  // Create base64 encoded segments
  const encodedHeader = header
  const encodedClaims = btoa(JSON.stringify(claims))
  
  // Create the content to be signed
  const signContent = `${encodedHeader}.${encodedClaims}`
  
  // Convert private key from PEM format
  const privateKey = key.replace(/\\n/g, '\n')
                        .replace('-----BEGIN PRIVATE KEY-----\n', '')
                        .replace('\n-----END PRIVATE KEY-----', '')
  
  // Import the private key
  const binaryKey = Uint8Array.from(atob(privateKey), c => c.charCodeAt(0))
  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    binaryKey,
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256',
    },
    false,
    ['sign']
  )
  
  // Sign the content
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    new TextEncoder().encode(signContent)
  )
  
  // Convert signature to base64
  const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)))
  
  // Return complete JWT
  return `${signContent}.${encodedSignature}`
}

export const initializeGoogleDrive = async () => {
  try {
    console.log('Fetching Google Drive service account credentials...')
    const { data: credentials, error } = await supabase
      .from('google_drive_service_account')
      .select('*')
      .maybeSingle()

    if (error) {
      console.error('Error fetching Google Drive credentials:', error)
      throw new Error('Failed to fetch Google Drive credentials')
    }

    if (!credentials || credentials.client_email === 'placeholder@project.iam.gserviceaccount.com') {
      console.error('No valid Google Drive service account credentials found')
      throw new Error('Please configure valid Google Drive service account credentials')
    }

    const now = Math.floor(Date.now() / 1000)
    const claims = {
      iss: credentials.client_email,
      scope: 'https://www.googleapis.com/auth/drive.file',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now
    }

    const header = btoa(JSON.stringify({
      alg: 'RS256',
      typ: 'JWT'
    }))

    const jwt = await generateJWT(header, claims, credentials.private_key)

    // Exchange JWT for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt,
      }),
    })

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text()
      console.error('Token exchange failed:', error)
      throw new Error('Failed to get access token: ' + error)
    }

    const tokenData = await tokenResponse.json()
    return tokenData.access_token
  } catch (error) {
    console.error('Error initializing Google Drive:', error)
    throw error
  }
}

export const uploadToGoogleDrive = async (file: Blob, filename: string, folderId: string) => {
  try {
    console.log(`Uploading file: ${filename} to folder: ${folderId}`)
    
    const accessToken = await initializeGoogleDrive()
    
    if (!accessToken) {
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
        Authorization: `Bearer ${accessToken}`,
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
