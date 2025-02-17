
import { Textarea } from "@/components/ui/textarea"
import AudioRecorder from "./AudioRecorder"
import { Mic } from "lucide-react"

interface DescriptionInputProps {
  value: string
  onChange: (value: string) => void
}

export const DescriptionInput = ({ value, onChange }: DescriptionInputProps) => {
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <label htmlFor="description" className="text-base font-medium text-gray-700">
          Description
        </label>
        <AudioRecorder
          mode="description"
          onRecordingComplete={onChange}
          className="flex-shrink-0"
        />
      </div>
      <Textarea
        id="description"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Add any notes about the sighting..."
        className="min-h-[120px] rounded-xl resize-none"
      />
    </div>
  )
}
