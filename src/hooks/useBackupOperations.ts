import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { loadGoogleAPI, authenticateGoogleDrive, uploadToGoogleDrive, pickBackupFile } from "@/utils/googleDrive"

export const useBackupOperations = () => {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const BACKUP_FOLDER_ID = "1omb7OKYsogTGxZs6ygMHyecXwZvz"

  const isAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .maybeSingle()
    
    return profile?.is_admin ?? false
  }

  const sendDiscordNotification = async (message: string) => {
    try {
      setIsLoading(true)
      
      const adminCheck = await isAdmin()
      if (!adminCheck) {
        toast({
          title: "Access Denied",
          description: "Only administrators can send Discord notifications",
          variant: "destructive",
        })
        return
      }

      const { data: webhooks, error: webhooksError } = await supabase
        .from('discord_webhooks')
        .select('url, description')
        .eq('is_active', true)
      
      if (webhooksError) {
        console.error('Error fetching webhooks:', webhooksError)
        toast({
          title: "Error",
          description: "Failed to fetch Discord webhooks",
          variant: "destructive",
        })
        return
      }
      
      if (!webhooks || webhooks.length === 0) {
        toast({
          title: "No Webhooks Found",
          description: "Please add active Discord webhooks in the database",
          variant: "destructive",
        })
        return
      }

      console.log(`Found ${webhooks.length} active webhooks`)
      
      for (const webhook of webhooks) {
        try {
          console.log(`Sending notification to webhook: ${webhook.description || 'Unnamed webhook'}`)
          
          const response = await fetch(webhook.url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              content: message,
              username: "BirdWatch Backup Bot"
            })
          })

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }
          
          console.log(`Successfully sent notification to webhook: ${webhook.description || 'Unnamed webhook'}`)
        } catch (error) {
          console.error(`Failed to send to webhook ${webhook.description || 'Unnamed webhook'}:`, error)
          toast({
            title: "Webhook Error",
            description: `Failed to send to webhook: ${webhook.description || 'Unnamed webhook'}`,
            variant: "destructive",
          })
        }
      }

      toast({
        title: "Notifications Sent",
        description: `Successfully sent notifications to ${webhooks.length} webhook(s)`,
      })
    } catch (error) {
      console.error('Discord notification error:', error)
      toast({
        title: "Notification Error",
        description: "Failed to send Discord notifications",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
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
      
      // This will fail due to invalid folder ID
      await uploadToGoogleDrive(file, `birdwatch_backup_${new Date().toISOString()}.json`, BACKUP_FOLDER_ID)
      
      await sendDiscordNotification(`✅ Backup completed successfully at ${new Date().toLocaleString()}`)
      
      toast({
        title: "Backup Successful",
        description: "Your data has been backed up to Google Drive",
      })
    } catch (error) {
      console.error('Backup error:', error)
      await sendDiscordNotification(`❌ Backup failed at ${new Date().toLocaleString()}: ${error}`)
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
      
      await sendDiscordNotification(`🔄 Starting data restore from backup...`)

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
      
      await sendDiscordNotification(`✅ Data restore completed successfully at ${new Date().toLocaleString()}`)
      
      toast({
        title: "Restore Successful",
        description: "Your data has been restored from the backup",
      })
    } catch (error) {
      console.error('Restore error:', error)
      await sendDiscordNotification(`❌ Restore failed at ${new Date().toLocaleString()}: ${error}`)
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
    handleRestore,
    sendDiscordNotification
  }
}
