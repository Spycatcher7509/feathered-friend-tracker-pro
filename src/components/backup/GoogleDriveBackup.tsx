
import { Button } from "@/components/ui/button"
import { useBackupOperations } from "@/hooks/useBackupOperations"
import { useState, useEffect } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Code } from "@/components/ui/code"
import { useAdminGroups } from "@/hooks/useAdminGroups"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { ScheduleForm } from "./ScheduleForm"
import { ScheduleList } from "./ScheduleList"

const GoogleDriveBackup = () => {
  const { isLoading, handleBackup, handleRestore, sendDiscordNotification } = useBackupOperations()
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
      <div className="flex gap-4 flex-wrap">
        <Button 
          onClick={() => {
            setShowInstructions(true)
            handleBackup()
          }} 
          disabled={isLoading}
          className="bg-nature-600 hover:bg-nature-700 text-white"
        >
          Backup to Google Drive
        </Button>
        <Button 
          onClick={handleRestore} 
          disabled={isLoading}
          variant="outline"
          className="border-nature-600 text-nature-700 hover:bg-nature-50"
        >
          Restore from Backup
        </Button>
        <Button
          onClick={() => setShowScheduler(!showScheduler)}
          variant="secondary"
          className="bg-gray-100 hover:bg-gray-200"
        >
          Schedule Operation
        </Button>
      </div>

      {showScheduler && (
        <ScheduleForm onSubmit={handleScheduleOperation} />
      )}

      <ScheduleList 
        schedules={schedules} 
        onDelete={deleteSchedule}
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

export default GoogleDriveBackup
