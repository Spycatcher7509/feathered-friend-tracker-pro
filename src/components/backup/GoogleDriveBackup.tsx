
import { useState, useEffect } from "react"
import { useBackupOperations } from "@/hooks/useBackupOperations"
import { useAdminGroups } from "@/hooks/useAdminGroups"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OneOffOperations } from "./OneOffOperations"
import { ScheduledOperations } from "./ScheduledOperations"

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
  const [schedules, setSchedules] = useState([])

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
      setSchedules(data || [])
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

      if (error) {
        console.error('Error creating schedule:', error)
        throw error
      }

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

  // If not admin, don't render anything
  if (!isAdmin) {
    return null
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Google Drive Backup & Restore</h2>
      
      <Tabs defaultValue="one-off" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="one-off">One-off Operations</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled Operations</TabsTrigger>
        </TabsList>
        
        <TabsContent value="one-off" className="space-y-4">
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
          />
        </TabsContent>
        
        <TabsContent value="scheduled" className="space-y-4">
          <ScheduledOperations 
            showScheduler={showScheduler}
            setShowScheduler={setShowScheduler}
            handleScheduleOperation={handleScheduleOperation}
            schedules={schedules}
            deleteSchedule={deleteSchedule}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default GoogleDriveBackup
