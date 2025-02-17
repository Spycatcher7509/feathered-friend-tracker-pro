
import { Button } from "@/components/ui/button"
import { ScheduleForm } from "./ScheduleForm"
import { ScheduleList } from "./ScheduleList"
import { Plus } from "lucide-react"

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
    <div className="space-y-6">
      <div className="flex gap-4 flex-wrap">
        <Button
          onClick={() => setShowScheduler(!showScheduler)}
          className="bg-nature-600 hover:bg-nature-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create New Schedule
        </Button>
      </div>

      {showScheduler && (
        <div className="mt-4">
          <ScheduleForm onSubmit={handleScheduleOperation} />
        </div>
      )}

      <ScheduleList 
        schedules={schedules} 
        onDelete={deleteSchedule}
      />
    </div>
  )
}
