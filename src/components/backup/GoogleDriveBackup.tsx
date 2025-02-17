
import { useState, useEffect } from "react"
import { useBackupOperations } from "@/hooks/useBackupOperations"
import { useAdminGroups } from "@/hooks/useAdminGroups"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OneOffOperations } from "./OneOffOperations"
import { ScheduledOperations } from "./ScheduledOperations"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface BackupSchedule {
  id: string
  created_at: string
  frequency: "daily" | "weekly" | "monthly"
  time_of_day: string
  day_of_week: number | null
  day_of_month: number | null
  operation_type: "backup" | "restore"
  is_active?: boolean
  source_file_id?: string
  updated_at?: string
  user_id?: string
}

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
  const [showScheduler, setShowScheduler] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const { checkAdminStatus } = useAdminGroups()
  const currentDomain = window.location.origin
  const { toast } = useToast()
  const [schedules, setSchedules] = useState<BackupSchedule[]>([])

  useEffect(() => {
    const checkAdmin = async () => {
      const adminStatus = await checkAdminStatus()
      setIsAdmin(adminStatus)
      if (adminStatus) {
        fetchSchedules()
      }
    }
    checkAdmin()
  }, [])

  const fetchSchedules = async () => {
    const { data, error } = await supabase
      .from('custom_backup_schedules')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching schedules:', error)
      toast({
        title: "Error",
        description: "Failed to fetch backup schedules",
        variant: "destructive",
      })
    } else {
      const validSchedules = (data || []).map(schedule => ({
        ...schedule,
        operation_type: schedule.operation_type === "restore" ? "restore" : "backup"
      })) as BackupSchedule[]
      
      setSchedules(validSchedules)
    }
  }

  const handleScheduleOperation = async (formData: {
    frequency: "daily" | "weekly" | "monthly",
    timeOfDay: string,
    dayOfWeek: string,
    dayOfMonth: string,
    operationType: "backup" | "restore"
  }) => {
    try {
      console.log("Creating new schedule:", formData)

      const { data, error } = await supabase
        .from('custom_backup_schedules')
        .insert({
          frequency: formData.frequency,
          time_of_day: formData.timeOfDay,
          day_of_week: formData.frequency === 'weekly' ? parseInt(formData.dayOfWeek) : null,
          day_of_month: formData.frequency === 'monthly' ? parseInt(formData.dayOfMonth) : null,
          operation_type: formData.operationType
        })
        .select()

      if (error) throw error

      await sendDiscordNotification(`🔄 New ${formData.operationType} schedule created:
• Frequency: ${formData.frequency}
• Time: ${formData.timeOfDay}
${formData.frequency === 'weekly' ? `• Day: ${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][parseInt(formData.dayOfWeek)]}` : ''}
${formData.frequency === 'monthly' ? `• Day of Month: ${formData.dayOfMonth}` : ''}`)

      toast({
        title: "Success",
        description: `${formData.operationType} schedule created successfully`,
      })

      fetchSchedules()
      setShowScheduler(false)
    } catch (error) {
      console.error('Error creating schedule:', error)
      toast({
        title: "Error",
        description: `Failed to create ${formData.operationType} schedule`,
        variant: "destructive",
      })
    }
  }

  const deleteSchedule = async (id: string) => {
    try {
      const scheduleToDelete = schedules.find(s => s.id === id)
      if (!scheduleToDelete) return

      const { error } = await supabase
        .from('custom_backup_schedules')
        .delete()
        .eq('id', id)

      if (error) throw error

      await sendDiscordNotification(`❌ ${scheduleToDelete.operation_type} schedule deleted:
• Frequency: ${scheduleToDelete.frequency}
• Time: ${scheduleToDelete.time_of_day}
${scheduleToDelete.day_of_week !== null ? `• Day: ${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][scheduleToDelete.day_of_week]}` : ''}
${scheduleToDelete.day_of_month !== null ? `• Day of Month: ${scheduleToDelete.day_of_month}` : ''}`)

      toast({
        title: "Success",
        description: "Schedule deleted successfully",
      })

      fetchSchedules()
    } catch (error) {
      console.error('Error deleting schedule:', error)
      toast({
        title: "Error",
        description: "Failed to delete schedule",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-4">
      {!isAdmin && (
        <Alert variant="default" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You can backup and restore your own data. Please note that this will only affect your personal data.
          </AlertDescription>
        </Alert>
      )}
      
      {isAdmin ? (
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
              <ScheduledOperations 
                showScheduler={showScheduler}
                setShowScheduler={setShowScheduler}
                handleScheduleOperation={handleScheduleOperation}
                schedules={schedules}
                deleteSchedule={deleteSchedule}
              />
            </TabsContent>
          </Tabs>
        </>
      ) : (
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
      )}
    </div>
  )
}

export default GoogleDriveBackup
