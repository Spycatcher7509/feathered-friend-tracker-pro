
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { useAdminGroups } from "@/hooks/useAdminGroups"
import { createBackup, restoreBackup } from "@/utils/backup"
import { sendDiscordWebhookMessage } from "@/utils/discord"

export const pickBackupFile = async () => {
  console.log('Opening file picker...')
  return new Promise<{ id: string; text: () => Promise<string> } | null>((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0] || null
      if (file) {
        resolve({
          id: file.name, // Using filename as ID for now
          text: () => file.text()
        })
      } else {
        resolve(null)
      }
    }
    input.click()
  })
}

export const useBackupOperations = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [showDisclaimer, setShowDisclaimer] = useState(false)
  const [operationType, setOperationType] = useState<'backup' | 'restore'>('backup')
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

  const initiateBackup = () => {
    setOperationType('backup')
    setShowDisclaimer(true)
  }

  const initiateRestore = () => {
    setOperationType('restore')
    setShowDisclaimer(true)
  }

  const handleBackup = async () => {
    try {
      setIsLoading(true)
      await createBackup()
      
      toast({
        title: "Backup Successful",
        description: "Your data has been backed up",
      })
    } catch (error) {
      console.error('Backup error:', error)
      if (await isAdmin()) {
        await sendDiscordWebhookMessage(`❌ Backup failed at ${new Date().toLocaleString()}: ${error}`)
      }
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
      if (await isAdmin()) {
        await sendDiscordWebhookMessage(`❌ Restore failed at ${new Date().toLocaleString()}: ${error}`)
      }
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
    showDisclaimer,
    setShowDisclaimer,
    operationType,
    handleBackup,
    handleRestore,
    sendDiscordNotification,
    pickBackupFile,
    initiateBackup,
    initiateRestore
  }
}
