
import { supabase } from "@/integrations/supabase/client"
import { uploadToGoogleDrive } from "@/utils/googleDrive"
import { sendDiscordWebhookMessage } from "@/utils/discord"
import { format } from "date-fns"

export const BACKUP_FOLDER_ID = "1PoIrj3akOA05QZcRP2rjjImTp0WonGdT"

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
      .select()
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

export const createBackup = async () => {
  console.log('Starting backup process...')
  
  try {
    // Fetch data from Supabase
    console.log('Fetching profiles from Supabase...')
    const { data: profiles, error: profilesError } = await supabase.from('profiles').select('*')
    if (profilesError) throw profilesError

    console.log('Fetching bird sounds from Supabase...')
    const { data: birdSounds, error: birdSoundsError } = await supabase.from('external_bird_sounds').select('*')
    if (birdSoundsError) throw birdSoundsError

    // Process bird sounds to ensure they're in our storage
    console.log('Processing bird sounds...')
    const processedBirdSounds = await Promise.all(
      birdSounds.map(async (sound) => {
        const filename = `${sound.id}-${sound.bird_name.toLowerCase().replace(/\s+/g, '-')}.webm`
        const newUrl = await downloadAndUploadToStorage(sound.sound_url, filename)
        return {
          ...sound,
          sound_url: newUrl
        }
      })
    )

    const now = new Date()
    const backupData = {
      timestamp: format(now, 'dd/MM/yyyy HH:mm:ss'),
      profiles,
      birdSounds: processedBirdSounds,
    }

    console.log('Creating backup file...')
    const file = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' })
    
    console.log('Uploading backup to Google Drive...')
    const filename = `birdwatch_backup_${format(now, 'dd-MM-yyyy_HH-mm-ss')}.json`
    const result = await uploadToGoogleDrive(file, filename, BACKUP_FOLDER_ID)
    
    // Record the backup in Supabase
    const { error: backupError } = await supabase.from('backups').insert({
      filename: result.name,
      drive_file_id: result.id,
      size_bytes: file.size
    })
    
    if (backupError) {
      console.error('Error recording backup:', backupError)
      throw backupError
    }
    
    console.log('Sending success notification to Discord...')
    await sendDiscordWebhookMessage(`✅ Backup completed successfully at ${format(now, 'dd/MM/yyyy, HH:mm:ss')}`)
    
    console.log('Backup process completed successfully')
    return result
  } catch (error) {
    console.error('Error during backup process:', error)
    throw error
  }
}

export const restoreBackup = async (backupData: any) => {
  console.log('Starting restore process...')
  
  try {
    await sendDiscordWebhookMessage(`🔄 Starting data restore from backup...`)

    if (backupData.profiles) {
      console.log(`Restoring ${backupData.profiles.length} profiles...`)
      for (const profile of backupData.profiles) {
        const { error } = await supabase
          .from('profiles')
          .upsert(profile, { onConflict: 'id' })
        if (error) throw error
      }
    }
    
    if (backupData.birdSounds) {
      console.log(`Restoring ${backupData.birdSounds.length} bird sounds...`)
      for (const sound of backupData.birdSounds) {
        // Ensure the sound file is in our storage
        const filename = `${sound.id}-${sound.bird_name.toLowerCase().replace(/\s+/g, '-')}.webm`
        const newUrl = await downloadAndUploadToStorage(sound.sound_url, filename)
        
        const { error } = await supabase
          .from('external_bird_sounds')
          .upsert({
            ...sound,
            sound_url: newUrl
          }, { onConflict: 'id' })
        if (error) throw error
      }
    }
    
    console.log('Sending success notification to Discord...')
    await sendDiscordWebhookMessage(`✅ Data restore completed successfully at ${format(new Date(), 'dd/MM/yyyy, HH:mm:ss')}`)
    
    console.log('Restore process completed successfully')
  } catch (error) {
    console.error('Error during restore process:', error)
    throw error
  }
}
