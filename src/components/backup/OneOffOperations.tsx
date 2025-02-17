
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Code } from "@/components/ui/code"
import { BackupDisclaimerDialog } from "./BackupDisclaimerDialog"

interface OneOffOperationsProps {
  isLoading: boolean
  handleBackup: () => void
  handleRestore: () => void
  sendDiscordNotification: (message: string) => Promise<void>
  setShowInstructions: (show: boolean) => void
  showInstructions: boolean
  currentDomain: string
  showDisclaimer: boolean
  setShowDisclaimer: (show: boolean) => void
  operationType: 'backup' | 'restore'
  initiateBackup: () => void
  initiateRestore: () => void
}

export const OneOffOperations = ({
  isLoading,
  handleBackup,
  handleRestore,
  sendDiscordNotification,
  setShowInstructions,
  showInstructions,
  currentDomain,
  showDisclaimer,
  setShowDisclaimer,
  operationType,
  initiateBackup,
  initiateRestore
}: OneOffOperationsProps) => {
  return (
    <div className="space-y-4">
      <div className="flex gap-4 flex-wrap">
        <Button 
          onClick={() => {
            setShowInstructions(true)
            initiateBackup()
          }} 
          disabled={isLoading}
          className="bg-nature-600 hover:bg-nature-700 text-white"
        >
          Run One-off Backup
        </Button>
        <Button 
          onClick={initiateRestore}
          disabled={isLoading}
          variant="outline"
          className="border-nature-600 text-nature-700 hover:bg-nature-50"
        >
          Run One-off Restore
        </Button>
        <Button
          onClick={() => sendDiscordNotification("Test notification from BirdWatch backup system")}
          variant="secondary"
          className="bg-gray-100 hover:bg-gray-200"
        >
          Test Discord Notifications
        </Button>
      </div>

      <BackupDisclaimerDialog
        open={showDisclaimer}
        onOpenChange={setShowDisclaimer}
        onAccept={() => operationType === 'backup' ? handleBackup() : handleRestore()}
        onCancel={() => setShowDisclaimer(false)}
        type={operationType}
      />

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
