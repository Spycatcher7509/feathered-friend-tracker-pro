
import { useState, useEffect } from "react"
import { useBackupOperations } from "@/hooks/useBackupOperations"
import { useAdminGroups } from "@/hooks/useAdminGroups"
import { AdminBackupView } from "./AdminBackupView"
import { UserBackupView } from "./UserBackupView"

const GoogleDriveBackup = () => {
  const { 
    isLoading, 
    handleBackup, 
    handleRestore, 
    sendDiscordNotification,
    showDisclaimer,
    setShowDisclaimer,
    operationType,
    initiateBackup,
    initiateRestore
  } = useBackupOperations()
  
  const [showInstructions, setShowInstructions] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const { checkAdminStatus } = useAdminGroups()
  const currentDomain = window.location.origin

  useEffect(() => {
    const checkAdmin = async () => {
      const adminStatus = await checkAdminStatus()
      setIsAdmin(adminStatus)
    }
    checkAdmin()
  }, [])

  return (
    <div className="space-y-4">
      {isAdmin ? (
        <AdminBackupView
          isLoading={isLoading}
          handleBackup={handleBackup}
          handleRestore={handleRestore}
          sendDiscordNotification={sendDiscordNotification}
          showInstructions={showInstructions}
          setShowInstructions={setShowInstructions}
          currentDomain={currentDomain}
          showDisclaimer={showDisclaimer}
          setShowDisclaimer={setShowDisclaimer}
          operationType={operationType}
          initiateBackup={initiateBackup}
          initiateRestore={initiateRestore}
        />
      ) : (
        <UserBackupView
          isLoading={isLoading}
          handleBackup={handleBackup}
          handleRestore={handleRestore}
          sendDiscordNotification={sendDiscordNotification}
          showInstructions={showInstructions}
          setShowInstructions={setShowInstructions}
          currentDomain={currentDomain}
          showDisclaimer={showDisclaimer}
          setShowDisclaimer={setShowDisclaimer}
          operationType={operationType}
          initiateBackup={initiateBackup}
          initiateRestore={initiateRestore}
        />
      )}
    </div>
  )
}

export default GoogleDriveBackup
