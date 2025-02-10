
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { useAdminGroups } from "@/hooks/useAdminGroups"
import { pickBackupFile } from "@/utils/googleDrive"
import { createBackup, restoreBackup } from "@/utils/backup"
import { sendDiscordWebhookMessage } from "@/utils/discord"

export const useBackupOperations = () => {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { checkAdminStatus } = useAdminGroups()

  const isAdmin = async () => {
    const adminStatus = await checkAdminStatus()
    if (!adminStatus) {
      console.log("User is not an admin")
      return false
    }
    return true
  }

  const sendDiscordNotification = async (message: string) => {
    try {
      console.log("Starting Discord notification process...")
      setIsLoading(true)
      
      const adminCheck = await isAdmin()
      if (!adminCheck) {
        console.log("User is not an admin, aborting notification")
        toast({
          title: "Access Denied",
          description: "Only the authorized administrator can send Discord notifications",
          variant: "destructive",
        })
        return
      }

      await sendDiscordWebhookMessage(message)
      
      toast({
        title: "Notifications Sent",
        description: "Successfully sent Discord notification",
      })
    } catch (error) {
      console.error('Discord notification error:', error)
      toast({
        title: "Notification Error",
        description: error instanceof Error ? error.message : "Failed to send Discord notifications",
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
          description: "Only the authorized administrator can perform backup operations",
          variant: "destructive",
        })
        return
      }

      await createBackup()
      
      toast({
        title: "Backup Successful",
        description: "Your data has been backed up to Google Drive",
      })
    } catch (error) {
      console.error('Backup error:', error)
      await sendDiscordWebhookMessage(`❌ Backup failed at ${new Date().toLocaleString()}: ${error}`)
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
          description: "Only the authorized administrator can perform restore operations",
          variant: "destructive",
        })
        return
      }
      
      const file = await pickBackupFile()
      if (!file) return
      
      const backupData = JSON.parse(await file.text())
      await restoreBackup(backupData)
      
      toast({
        title: "Restore Successful",
        description: "Your data has been restored from the backup",
      })
    } catch (error) {
      console.error('Restore error:', error)
      await sendDiscordWebhookMessage(`❌ Restore failed at ${new Date().toLocaleString()}: ${error}`)
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
