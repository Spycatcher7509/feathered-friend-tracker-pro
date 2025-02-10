
import { supabase } from "@/integrations/supabase/client"
import { loadGoogleAPI, authenticateGoogleDrive, uploadToGoogleDrive } from "@/utils/googleDrive"
import { sendDiscordWebhookMessage } from "@/utils/discord"

export const BACKUP_FOLDER_ID = "1omb7OKYsogTGxZs6ygMHyecXwZvz"

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

    const backupData = {
      timestamp: new Date().toISOString(),
      profiles,
      birdSounds,
    }

    console.log('Creating backup file...')
    const file = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' })
    
    console.log('Loading Google API...')
    await loadGoogleAPI()
    
    console.log('Authenticating with Google Drive...')
    await authenticateGoogleDrive()
    
    console.log('Uploading backup to Google Drive...')
    await uploadToGoogleDrive(file, `birdwatch_backup_${new Date().toISOString()}.json`, BACKUP_FOLDER_ID)
    
    console.log('Sending success notification to Discord...')
    await sendDiscordWebhookMessage(`✅ Backup completed successfully at ${new Date().toLocaleString()}`)
    
    console.log('Backup process completed successfully')
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
        const { error } = await supabase
          .from('external_bird_sounds')
          .upsert(sound, { onConflict: 'id' })
        if (error) throw error
      }
    }
    
    console.log('Sending success notification to Discord...')
    await sendDiscordWebhookMessage(`✅ Data restore completed successfully at ${new Date().toLocaleString()}`)
    
    console.log('Restore process completed successfully')
  } catch (error) {
    console.error('Error during restore process:', error)
    throw error
  }
}
