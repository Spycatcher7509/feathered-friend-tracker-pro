
import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { OneOffOperations } from "./OneOffOperations"
import { ScheduledOperations } from "./ScheduledOperations"
import { BackupOperationsProps } from "./types"

export const AdminBackupView = ({
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
      <h2 className="text-xl font-semibold mb-4">Google Drive Backup & Restore</h2>
      
      <Tabs defaultValue="one-off" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="one-off">One-off Operations</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled Operations</TabsTrigger>
        </TabsList>
        
        <TabsContent value="one-off">
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
            isAdmin={true}
          />
        </TabsContent>
        
        <TabsContent value="scheduled">
          <ScheduledOperations />
        </TabsContent>
      </Tabs>
    </>
  )
}
