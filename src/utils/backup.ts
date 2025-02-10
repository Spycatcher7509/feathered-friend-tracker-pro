
import { supabase } from "@/integrations/supabase/client"
import { loadGoogleAPI, authenticateGoogleDrive, uploadToGoogleDrive } from "@/utils/googleDrive"
import { sendDiscordWebhookMessage } from "@/utils/discord"

export const BACKUP_FOLDER_ID = "1omb7OKYsogTGxZs6ygMHyecXwZvz"

export const createBackup = async () => {
  const { data: profiles } = await supabase.from('profiles').select('*')
  const { data: birdSounds } = await supabase.from('external_bird_sounds').select('*')

  const backupData = {
    timestamp: new Date().toISOString(),
    profiles,
    birdSounds,
  }

  const file = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' })
  
  await loadGoogleAPI()
  await authenticateGoogleDrive()
  
  await uploadToGoogleDrive(file, `birdwatch_backup_${new Date().toISOString()}.json`, BACKUP_FOLDER_ID)
  
  await sendDiscordWebhookMessage(`✅ Backup completed successfully at ${new Date().toLocaleString()}`)
}

export const restoreBackup = async (backupData: any) => {
  await sendDiscordWebhookMessage(`🔄 Starting data restore from backup...`)

  if (backupData.profiles) {
    for (const profile of backupData.profiles) {
      await supabase
        .from('profiles')
        .upsert(profile, { onConflict: 'id' })
    }
  }
  
  if (backupData.birdSounds) {
    for (const sound of backupData.birdSounds) {
      await supabase
        .from('external_bird_sounds')
        .upsert(sound, { onConflict: 'id' })
    }
  }
  
  await sendDiscordWebhookMessage(`✅ Data restore completed successfully at ${new Date().toLocaleString()}`)
}

