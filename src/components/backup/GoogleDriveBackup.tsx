
import { Button } from "@/components/ui/button"
import { useBackupOperations } from "@/hooks/useBackupOperations"

const GoogleDriveBackup = () => {
  const { isLoading, handleBackup, handleRestore, sendDiscordNotification } = useBackupOperations()

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Backup & Restore</h2>
      <div className="flex gap-4 flex-wrap">
        <Button 
          onClick={handleBackup} 
          disabled={isLoading}
        >
          Backup to Google Drive
        </Button>
        <Button 
          onClick={handleRestore} 
          disabled={isLoading}
          variant="outline"
        >
          Restore from Google Drive
        </Button>
        <Button
          onClick={() => sendDiscordNotification("Test notification")}
          variant="secondary"
        >
          Test Discord Notifications
        </Button>
      </div>
    </div>
  )
}

export default GoogleDriveBackup
