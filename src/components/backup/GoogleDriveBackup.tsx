import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"

const GoogleDriveBackup = () => {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleBackup = async () => {
    try {
      setIsLoading(true)
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
      
      const { data: birdSounds } = await supabase
        .from('external_bird_sounds')
        .select('*')

      const backupData = {
        timestamp: new Date().toISOString(),
        profiles,
        birdSounds,
      }

      const file = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' })
      
      // Initialize Google Drive API
      const gapi = await loadGoogleAPI()
      await authenticateGoogleDrive()
      
      // Upload to Google Drive
      await uploadToGoogleDrive(file, `birdwatch_backup_${new Date().toISOString()}.json`)
      
      toast({
        title: "Backup Successful",
        description: "Your data has been backed up to Google Drive",
      })
    } catch (error) {
      console.error('Backup error:', error)
      toast({
        title: "Backup Failed",
        description: "There was an error backing up your data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRestore = async () => {
    try {
      setIsLoading(true)
      
      // Initialize Google Drive API
      const gapi = await loadGoogleAPI()
      await authenticateGoogleDrive()
      
      // Pick the backup file
      const file = await pickBackupFile()
      if (!file) return
      
      const backupData = JSON.parse(await file.text())
      
      // Restore profiles
      if (backupData.profiles) {
        for (const profile of backupData.profiles) {
          await supabase
            .from('profiles')
            .upsert(profile, { onConflict: 'id' })
        }
      }
      
      // Restore bird sounds
      if (backupData.birdSounds) {
        for (const sound of backupData.birdSounds) {
          await supabase
            .from('external_bird_sounds')
            .upsert(sound, { onConflict: 'id' })
        }
      }
      
      toast({
        title: "Restore Successful",
        description: "Your data has been restored from the backup",
      })
    } catch (error) {
      console.error('Restore error:', error)
      toast({
        title: "Restore Failed",
        description: "There was an error restoring your data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Backup & Restore</h2>
      <div className="flex gap-4">
        <Button 
          onClick={handleBackup} 
          disabled={isLoading}
        >
          Backup to Google Drive
        </Button>
        <Button 
          onClick={handleRestore} 
          disabled={isLoading}
          variant="outline"
        >
          Restore from Google Drive
        </Button>
      </div>
    </div>
  )
}

// Google Drive API helper functions
const loadGoogleAPI = async () => {
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

const authenticateGoogleDrive = async () => {
  if (!window.gapi.auth2.getAuthInstance().isSignedIn.get()) {
    await window.gapi.auth2.getAuthInstance().signIn()
  }
}

const uploadToGoogleDrive = async (file: Blob, filename: string) => {
  const metadata = {
    name: filename,
    mimeType: 'application/json',
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

const pickBackupFile = async () => {
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

export default GoogleDriveBackup