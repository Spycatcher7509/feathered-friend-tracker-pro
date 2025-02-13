
import { Button } from "@/components/ui/button"

interface Schedule {
  id: string
  operation_type: "backup" | "restore"
  frequency: "daily" | "weekly" | "monthly"
  time_of_day: string
  day_of_week: number | null
  day_of_month: number | null
  source_file_id?: string
}

interface ScheduleListProps {
  schedules: Schedule[]
  onDelete: (id: string) => void
}

export const ScheduleList = ({ schedules, onDelete }: ScheduleListProps) => {
  const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  if (schedules.length === 0) return null

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-2">Existing Schedules</h3>
      <div className="space-y-2">
        {schedules.map((schedule) => (
          <div key={schedule.id} className="flex justify-between items-center p-3 border rounded-lg">
            <div>
              <span className="font-medium capitalize">{schedule.operation_type}</span>
              <span className="mx-2">•</span>
              <span className="font-medium capitalize">{schedule.frequency}</span>
              <span className="mx-2">at</span>
              <span>{schedule.time_of_day}</span>
              {schedule.frequency === 'weekly' && schedule.day_of_week !== null && (
                <span className="ml-2">on {weekDays[schedule.day_of_week]}</span>
              )}
              {schedule.frequency === 'monthly' && schedule.day_of_month !== null && (
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
              onClick={() => onDelete(schedule.id)}
            >
              Delete
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
