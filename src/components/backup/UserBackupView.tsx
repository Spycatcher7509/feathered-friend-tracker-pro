
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { OneOffOperations } from "./OneOffOperations"
import { BackupOperationsProps } from "./types"

export const UserBackupView = ({
  isLoading,
  handleBackup,
  handleRestore,
  sendDiscordNotification,
  showInstructions,
  setShowInstructions,
  currentDomain,
  showDisclaimer,
  setShowDisclaimer,
  operationType,
  initiateBackup,
  initiateRestore,
}: BackupOperationsProps) => {
  return (
    <>
      <Alert variant="default" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          You can backup and restore your own data. Your backups will be saved to your local computer.
        </AlertDescription>
      </Alert>
      
      <OneOffOperations 
        isLoading={isLoading}
        handleBackup={handleBackup}
        handleRestore={handleRestore}
        sendDiscordNotification={sendDiscordNotification}
        setShowInstructions={setShowInstructions}
        showInstructions={showInstructions}
        currentDomain={currentDomain}
        showDisclaimer={showDisclaimer}
        setShowDisclaimer={setShowDisclaimer}
        operationType={operationType}
        initiateBackup={initiateBackup}
        initiateRestore={initiateRestore}
        isAdmin={false}
      />
    </>
  )
}
