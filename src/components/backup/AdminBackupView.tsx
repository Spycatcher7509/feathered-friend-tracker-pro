
import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OneOffOperations } from "./OneOffOperations"
import { ScheduledOperations } from "./ScheduledOperations"
import { BackupOperationsProps, BackupSchedule } from "./types"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

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
  const [showScheduler, setShowScheduler] = useState(false)
  const [schedules, setSchedules] = useState<BackupSchedule[]>([])
  const { toast } = useToast()

  // Fetch schedules on component mount
  useEffect(() => {
    fetchSchedules()
  }, [])

  const fetchSchedules = async () => {
    const { data, error } = await supabase
      .from('backup_schedules')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch backup schedules",
        variant: "destructive",
      })
      return
    }

    // Ensure the data matches our BackupSchedule type
    const typedSchedules: BackupSchedule[] = (data || []).map(schedule => ({
      id: schedule.id,
      created_at: schedule.created_at,
      frequency: schedule.frequency as "daily" | "weekly" | "monthly",
      time_of_day: schedule.time_of_day,
      day_of_week: schedule.day_of_week,
      day_of_month: schedule.day_of_month,
      operation_type: schedule.operation_type as "backup" | "restore",
      is_active: schedule.is_active ?? true,
      source_file_id: schedule.source_file_id,
      updated_at: schedule.updated_at,
      user_id: schedule.user_id
    }))

    setSchedules(typedSchedules)
  }

  const handleScheduleOperation = async (formData: {
    frequency: "daily" | "weekly" | "monthly"
    timeOfDay: string
    dayOfWeek: string
    dayOfMonth: string
    operationType: "backup" | "restore"
  }) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create schedules",
        variant: "destructive",
      })
      return
    }

    const { error } = await supabase.from('backup_schedules').insert({
      frequency: formData.frequency,
      time_of_day: formData.timeOfDay,
      day_of_week: formData.dayOfWeek ? parseInt(formData.dayOfWeek) : null,
      day_of_month: formData.dayOfMonth ? parseInt(formData.dayOfMonth) : null,
      operation_type: formData.operationType,
      user_id: user.id,
      is_active: true
    })

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create backup schedule",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Success",
      description: "Backup schedule created successfully",
    })
    
    fetchSchedules()
    setShowScheduler(false)
  }

  const deleteSchedule = async (id: string) => {
    const { error } = await supabase
      .from('backup_schedules')
      .delete()
      .eq('id', id)

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete backup schedule",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Success",
      description: "Backup schedule deleted successfully",
    })
    
    fetchSchedules()
  }

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
  )
}
