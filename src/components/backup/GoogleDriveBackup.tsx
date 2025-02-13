
import { Button } from "@/components/ui/button"
import { useBackupOperations } from "@/hooks/useBackupOperations"
import { useState, useEffect } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Code } from "@/components/ui/code"
import { useAdminGroups } from "@/hooks/useAdminGroups"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

const GoogleDriveBackup = () => {
  const { isLoading, handleBackup, handleRestore, sendDiscordNotification, pickBackupFile } = useBackupOperations()
  const [showInstructions, setShowInstructions] = useState(false)
  const [showScheduler, setShowScheduler] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const { checkAdminStatus } = useAdminGroups()
  const currentDomain = window.location.origin
  const { toast } = useToast()

  // Schedule state
  const [scheduleFrequency, setScheduleFrequency] = useState("daily")
  const [scheduleTime, setScheduleTime] = useState("00:00")
  const [scheduleDayOfWeek, setScheduleDayOfWeek] = useState("0")
  const [scheduleDayOfMonth, setScheduleDayOfMonth] = useState("1")
  const [schedules, setSchedules] = useState([])
  const [operationType, setOperationType] = useState("backup")
  const [selectedBackupId, setSelectedBackupId] = useState("")

  useEffect(() => {
    const checkAdmin = async () => {
      const adminStatus = await checkAdminStatus()
      setIsAdmin(adminStatus)
    }
    checkAdmin()
    
    if (isAdmin) {
      fetchSchedules()
    }
  }, [isAdmin])

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
      setSchedules(data)
    }
  }

  const handleScheduleOperation = async () => {
    try {
      let sourceFileId = null
      
      if (operationType === 'restore') {
        const file = await pickBackupFile()
        if (!file) return
        sourceFileId = file.id
      }

      const { data, error } = await supabase
        .from('custom_backup_schedules')
        .insert({
          frequency: scheduleFrequency,
          time_of_day: scheduleTime,
          day_of_week: scheduleFrequency === 'weekly' ? parseInt(scheduleDayOfWeek) : null,
          day_of_month: scheduleFrequency === 'monthly' ? parseInt(scheduleDayOfMonth) : null,
          operation_type: operationType,
          source_file_id: sourceFileId
        })
        .select()

      if (error) throw error

      await sendDiscordNotification(`🔄 New ${operationType} schedule created:
• Frequency: ${scheduleFrequency}
• Time: ${scheduleTime}
${scheduleFrequency === 'weekly' ? `• Day: ${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][parseInt(scheduleDayOfWeek)]}` : ''}
${scheduleFrequency === 'monthly' ? `• Day of Month: ${scheduleDayOfMonth}` : ''}
${sourceFileId ? `• Source File ID: ${sourceFileId}` : ''}`)

      toast({
        title: "Success",
        description: `${operationType} schedule created successfully`,
      })

      fetchSchedules()
      setShowScheduler(false)
    } catch (error) {
      console.error('Error creating schedule:', error)
      toast({
        title: "Error",
        description: `Failed to create ${operationType} schedule`,
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
      <h2 className="text-xl font-semibold">Backup & Restore</h2>
      <div className="flex gap-4 flex-wrap">
        <Button 
          onClick={() => {
            setShowInstructions(true)
            handleBackup()
          }} 
          disabled={isLoading}
          className="bg-nature-600 hover:bg-nature-700"
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
          onClick={() => setShowScheduler(!showScheduler)}
          variant="secondary"
        >
          Schedule Operation
        </Button>
        <Button
          onClick={() => sendDiscordNotification("Test notification")}
          variant="secondary"
          className="bg-gray-100 hover:bg-gray-200"
        >
          Test Discord Notifications
        </Button>
      </div>

      {showScheduler && (
        <div className="p-4 border rounded-lg space-y-4 bg-white">
          <h3 className="text-lg font-semibold">Schedule New Operation</h3>
          <div className="grid gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Operation Type</label>
              <RadioGroup
                value={operationType}
                onValueChange={setOperationType}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="backup" id="backup" />
                  <Label htmlFor="backup">Backup</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="restore" id="restore" />
                  <Label htmlFor="restore">Restore</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Frequency</label>
              <Select value={scheduleFrequency} onValueChange={setScheduleFrequency}>
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Time</label>
              <Input
                type="time"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
              />
            </div>

            {scheduleFrequency === 'weekly' && (
              <div>
                <label className="block text-sm font-medium mb-1">Day of Week</label>
                <Select value={scheduleDayOfWeek} onValueChange={setScheduleDayOfWeek}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Sunday</SelectItem>
                    <SelectItem value="1">Monday</SelectItem>
                    <SelectItem value="2">Tuesday</SelectItem>
                    <SelectItem value="3">Wednesday</SelectItem>
                    <SelectItem value="4">Thursday</SelectItem>
                    <SelectItem value="5">Friday</SelectItem>
                    <SelectItem value="6">Saturday</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {scheduleFrequency === 'monthly' && (
              <div>
                <label className="block text-sm font-medium mb-1">Day of Month</label>
                <Input
                  type="number"
                  min="1"
                  max="31"
                  value={scheduleDayOfMonth}
                  onChange={(e) => setScheduleDayOfMonth(e.target.value)}
                />
              </div>
            )}

            <Button onClick={handleScheduleOperation}>
              Create Schedule
            </Button>
          </div>
        </div>
      )}

      {schedules.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Existing Schedules</h3>
          <div className="space-y-2">
            {schedules.map((schedule: any) => (
              <div key={schedule.id} className="flex justify-between items-center p-3 border rounded-lg">
                <div>
                  <span className="font-medium capitalize">{schedule.operation_type}</span>
                  <span className="mx-2">•</span>
                  <span className="font-medium capitalize">{schedule.frequency}</span>
                  <span className="mx-2">at</span>
                  <span>{schedule.time_of_day}</span>
                  {schedule.frequency === 'weekly' && (
                    <span className="ml-2">on {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][schedule.day_of_week]}</span>
                  )}
                  {schedule.frequency === 'monthly' && (
                    <span className="ml-2">on day {schedule.day_of_month}</span>
                  )}
                  {schedule.source_file_id && (
                    <span className="ml-2 text-sm text-gray-500">
                      (File ID: {schedule.source_file_id})
                    </span>
                  )}
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteSchedule(schedule.id)}
                >
                  Delete
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

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
