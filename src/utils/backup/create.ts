
import { format } from "date-fns"
import { supabase } from "@/integrations/supabase/client"
import { uploadToGoogleDrive } from "@/utils/googleDrive"
import { sendDiscordWebhookMessage } from "@/utils/discord"
import { downloadAndUploadToStorage } from "./storage"
import { BackupData } from "./types"

export const BACKUP_FOLDER_ID = "1PoIrj3akOA05QZcRP2rjjImTp0WonGdT"

export const createBackup = async (isAdmin: boolean = false) => {
  console.log('Starting backup process...')
  
  try {
    if (isAdmin) {
      await sendDiscordWebhookMessage("🔄 Starting backup process...")
    }

    // Fetch data from Supabase for the current user
    console.log('Fetching profiles from Supabase...')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("User not authenticated")

    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, username, bio, avatar_url')
      .eq('id', user.id)

    if (profilesError) throw profilesError

    console.log('Fetching bird sounds from Supabase...')
    const { data: birdSounds, error: birdSoundsError } = await supabase
      .from('external_bird_sounds')
      .select('id, bird_name, sound_url, source, user_id')
      .eq('user_id', user.id)

    if (birdSoundsError) throw birdSoundsError

    // Process bird sounds to ensure they're in our storage
    console.log('Processing bird sounds...')
    const processedBirdSounds = await Promise.all(
      (birdSounds || []).map(async (sound) => {
        const filename = `${sound.id}-${sound.bird_name.toLowerCase().replace(/\s+/g, '-')}.webm`
        const newUrl = await downloadAndUploadToStorage(sound.sound_url, filename)
        return {
          ...sound,
          sound_url: newUrl
        }
      })
    )

    const now = new Date()
    const backupData: BackupData = {
      timestamp: format(now, 'dd/MM/yyyy HH:mm:ss'),
      profiles: profiles || [],
      birdSounds: processedBirdSounds,
    }

    // Create backup file
    const file = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' })
    const filename = `birdwatch_backup_${format(now, 'dd-MM-yyyy_HH-mm-ss')}.json`

    if (isAdmin) {
      // Admin backup to Google Drive
      console.log('Uploading backup to Google Drive...')
      const result = await uploadToGoogleDrive(file, filename, BACKUP_FOLDER_ID)
      
      // Record the backup in Supabase for admin
      const { error: backupError } = await supabase
        .from('backups')
        .insert({
          filename: result.name,
          drive_file_id: result.id,
          size_bytes: file.size,
          user_id: user.id
        })
      
      if (backupError) throw backupError
      
      await sendDiscordWebhookMessage(`✅ Backup completed successfully!
📅 Time: ${format(now, 'dd/MM/yyyy, HH:mm:ss')}
📁 Filename: ${result.name}
🔗 Drive File ID: ${result.id}`)
      
      return result
    } else {
      // Non-admin backup to local file
      try {
        // Create a download link
        const url = URL.createObjectURL(file)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        // Record the backup in Supabase for non-admin
        const { error: backupError } = await supabase
          .from('backups')
          .insert({
            filename,
            size_bytes: file.size,
            user_id: user.id,
            drive_file_id: null
          })
        
        if (backupError) throw backupError
        
        return { name: filename }
      } catch (error) {
        console.error('Error saving backup:', error)
        throw error
      }
    }
  } catch (error) {
    console.error('Error during backup process:', error)
    if (isAdmin) {
      await sendDiscordWebhookMessage(`❌ Backup failed at ${format(new Date(), 'dd/MM/yyyy, HH:mm:ss')}
    
⚠️ Error: ${error instanceof Error ? error.message : String(error)}`)
    }
    throw error
  }
}
