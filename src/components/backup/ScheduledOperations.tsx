
import { Button } from "@/components/ui/button"
import { ScheduleForm } from "./ScheduleForm"
import { ScheduleList } from "./ScheduleList"

interface ScheduledOperationsProps {
  showScheduler: boolean
  setShowScheduler: (show: boolean) => void
  handleScheduleOperation: (formData: {
    frequency: "daily" | "weekly" | "monthly"
    timeOfDay: string
    dayOfWeek: string
    dayOfMonth: string
    operationType: "backup" | "restore"
  }) => Promise<void>
  schedules: any[]
  deleteSchedule: (id: string) => Promise<void>
}

export const ScheduledOperations = ({
  showScheduler,
  setShowScheduler,
  handleScheduleOperation,
  schedules,
  deleteSchedule
}: ScheduledOperationsProps) => {
  return (
    <div className="space-y-4">
      <div className="flex gap-4 flex-wrap">
        <Button
          onClick={() => setShowScheduler(!showScheduler)}
          variant="secondary"
          className="bg-gray-100 hover:bg-gray-200"
        >
          Create New Schedule
        </Button>
      </div>

      {showScheduler && (
        <ScheduleForm onSubmit={handleScheduleOperation} />
      )}

      <ScheduleList 
        schedules={schedules} 
        onDelete={deleteSchedule}
      />
    </div>
  )
}
