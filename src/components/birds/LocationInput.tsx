
import { Input } from "@/components/ui/input"
import { MapPin } from "lucide-react"

interface LocationInputProps {
  value: string
  onChange: (value: string) => void
}

export const LocationInput = ({ value, onChange }: LocationInputProps) => {
  return (
    <div className="space-y-2">
      <label htmlFor="location" className="text-sm font-medium text-gray-700 flex items-center gap-2">
        <MapPin className="h-4 w-4" />
        Location
      </label>
      <Input
        id="location"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter location"
        required
      />
    </div>
  )
}
