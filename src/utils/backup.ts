
import { supabase } from "@/integrations/supabase/client"
import { uploadToGoogleDrive } from "@/utils/googleDrive"
import { sendDiscordWebhookMessage } from "@/utils/discord"
import { format } from "date-fns"

export const BACKUP_FOLDER_ID = "1PoIrj3akOA05QZcRP2rjjImTp0WonGdT"

interface BirdSound {
  id: string
  bird_name: string
  sound_url: string
  source: string
  user_id: string
}

interface Profile {
  id: string
  username?: string
  bio?: string
  avatar_url?: string
}

interface BackupData {
  timestamp: string
  profiles: Profile[]
  birdSounds: BirdSound[]
}

const downloadAndUploadToStorage = async (url: string, filename: string): Promise<string> => {
  try {
    // If URL is already in our storage, return it as is
    if (url.includes('supabase.co')) {
      return url
    }

    // For external URLs, create a direct reference in our storage
    const { data, error } = await supabase
      .from('external_bird_sounds')
      .update({ sound_url: url })
      .eq('sound_url', url)
      .select('id, bird_name, sound_url, source')
      .single()

    if (error) {
      console.error('Error updating sound URL:', error)
      return url
    }

    return url
  } catch (error) {
    console.error('Error processing sound file:', error)
    return url
  }
}

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

    if (isAdmin) {
      // Admin backup to Google Drive
      console.log('Creating backup file...')
      const file = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' })
      
      console.log('Uploading backup to Google Drive...')
      const filename = `birdwatch_backup_${format(now, 'dd-MM-yyyy_HH-mm-ss')}.json`
      const result = await uploadToGoogleDrive(file, filename, BACKUP_FOLDER_ID)
      
      // Record the backup in Supabase
      const { error: backupError } = await supabase.from('backups').insert({
        filename: result.name,
        drive_file_id: result.id,
        size_bytes: file.size,
      })
      
      if (backupError) throw backupError
      
      await sendDiscordWebhookMessage(`✅ Backup completed successfully!
📅 Time: ${format(now, 'dd/MM/yyyy, HH:mm:ss')}
📁 Filename: ${result.name}
🔗 Drive File ID: ${result.id}`)
      
      return result
    } else {
      // Non-admin backup to local file
      const file = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' })
      const filename = `my_birdwatch_backup_${format(now, 'dd-MM-yyyy_HH-mm-ss')}.json`
      
      // Create a download link and trigger it
      const url = window.URL.createObjectURL(file)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      
      return { name: filename }
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

export const restoreBackup = async (backupData: BackupData) => {
  console.log('Starting restore process...')
  
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("User not authenticated")

    if (backupData.profiles) {
      console.log(`Restoring ${backupData.profiles.length} profiles...`)
      for (const profile of backupData.profiles) {
        // For non-admin users, only restore their own profile
        if (profile.id === user.id) {
          const { error } = await supabase
            .from('profiles')
            .upsert(profile, { onConflict: 'id' })
          if (error) throw error
        }
      }
    }
    
    if (backupData.birdSounds) {
      console.log(`Restoring ${backupData.birdSounds.length} bird sounds...`)
      for (const sound of backupData.birdSounds) {
        // For non-admin users, only restore their own bird sounds
        if (sound.user_id === user.id) {
          // Ensure the sound file is in our storage
          const filename = `${sound.id}-${sound.bird_name.toLowerCase().replace(/\s+/g, '-')}.webm`
          const newUrl = await downloadAndUploadToStorage(sound.sound_url, filename)
          
          const { error } = await supabase
            .from('external_bird_sounds')
            .upsert({
              id: sound.id,
              bird_name: sound.bird_name,
              sound_url: newUrl,
              source: sound.source,
              user_id: sound.user_id
            }, { onConflict: 'id' })
          if (error) throw error
        }
      }
    }
    
    console.log('Restore process completed successfully')
  } catch (error) {
    console.error('Error during restore process:', error)
    throw error
  }
}
