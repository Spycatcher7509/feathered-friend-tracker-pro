
import { Button } from "@/components/ui/button"
import { useBackupOperations } from "@/hooks/useBackupOperations"
import { useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Code } from "@/components/ui/code"

const GoogleDriveBackup = () => {
  const { isLoading, handleBackup, handleRestore, sendDiscordNotification } = useBackupOperations()
  const [showInstructions, setShowInstructions] = useState(false)

  const currentDomain = window.location.origin

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Backup & Restore</h2>
      <div className="flex gap-4 flex-wrap">
        <Button 
          onClick={() => {
            setShowInstructions(true)
            handleBackup()
          }} 
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

      {showInstructions && (
        <Alert>
          <AlertDescription className="space-y-4">
            <p>If you see an authentication error, follow these steps in Google Cloud Console:</p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Go to the Google Cloud Console OAuth 2.0 settings</li>
              <li>Add this URL to "Authorized JavaScript origins":
                <div className="relative">
                  <Code className="my-2 block p-2 w-full">{currentDomain}</Code>
                </div>
              </li>
              <li>Add this URL to "Authorized redirect URIs":
                <div className="relative">
                  <Code className="my-2 block p-2 w-full">{currentDomain}</Code>
                </div>
              </li>
              <li>Save the changes and try the backup again</li>
            </ol>
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}

export default GoogleDriveBackup
