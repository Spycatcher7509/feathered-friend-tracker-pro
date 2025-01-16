import { Button } from "@/components/ui/button"
import { useBackupOperations } from "@/hooks/useBackupOperations"

const GoogleDriveBackup = () => {
  const { isLoading, handleBackup, handleRestore } = useBackupOperations()

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Backup & Restore</h2>
      <div className="flex gap-4">
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
      </div>
    </div>
  )
}

export default GoogleDriveBackup