
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"

interface ScheduleFormProps {
  onSubmit: (data: {
    frequency: "daily" | "weekly" | "monthly",
    timeOfDay: string,
    dayOfWeek: string,
    dayOfMonth: string,
    operationType: "backup" | "restore"
  }) => void;
}

export const ScheduleForm = ({ onSubmit }: ScheduleFormProps) => {
  const [scheduleFrequency, setScheduleFrequency] = useState<"daily" | "weekly" | "monthly">("daily")
  const [scheduleTime, setScheduleTime] = useState("00:00")
  const [scheduleDayOfWeek, setScheduleDayOfWeek] = useState("0")
  const [scheduleDayOfMonth, setScheduleDayOfMonth] = useState("1")
  const [operationType, setOperationType] = useState<"backup" | "restore">("backup")

  const handleSubmit = () => {
    onSubmit({
      frequency: scheduleFrequency,
      timeOfDay: scheduleTime,
      dayOfWeek: scheduleDayOfWeek,
      dayOfMonth: scheduleDayOfMonth,
      operationType
    })
  }

  return (
    <div className="p-4 border rounded-lg space-y-4 bg-white">
      <h3 className="text-lg font-semibold">Schedule New Operation</h3>
      <div className="grid gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium">Operation Type</label>
          <RadioGroup
            value={operationType}
            onValueChange={(value: "backup" | "restore") => setOperationType(value)}
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
          <Select value={scheduleFrequency} onValueChange={(value: "daily" | "weekly" | "monthly") => setScheduleFrequency(value)}>
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

        <Button onClick={handleSubmit}>Create Schedule</Button>
      </div>
    </div>
  )
}
