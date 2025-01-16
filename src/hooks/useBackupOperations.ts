import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { loadGoogleAPI, authenticateGoogleDrive, uploadToGoogleDrive, pickBackupFile } from "@/utils/googleDrive"

export const useBackupOperations = () => {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const BACKUP_FOLDER_ID = "1omb7OKYsogTGxZs6ygMHyxyJyecXwZvz"

  const isAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    return user?.email === 'accounts@thewrightsupport.com'
  }

  const handleBackup = async () => {
    try {
      setIsLoading(true)

      const adminCheck = await isAdmin()
      if (!adminCheck) {
        toast({
          title: "Access Denied",
          description: "Only administrators can perform backup operations",
          variant: "destructive",
        })
        return
      }

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

      const adminCheck = await isAdmin()
      if (!adminCheck) {
        toast({
          title: "Access Denied",
          description: "Only administrators can perform restore operations",
          variant: "destructive",
        })
        return
      }
      
      await loadGoogleAPI()
      await authenticateGoogleDrive()
      
      const file = await pickBackupFile()
      if (!file) return
      
      const backupData = JSON.parse(await file.text())
      
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

  return {
    isLoading,
    handleBackup,
    handleRestore
  }
}