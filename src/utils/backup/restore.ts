
import { supabase } from "@/integrations/supabase/client"
import { BackupData } from "./types"
import { downloadAndUploadToStorage } from "./storage"

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
