
import { Input } from "@/components/ui/input"
import { MapPin } from "lucide-react"

interface LocationInputProps {
  value: string
  onChange: (value: string) => void
}

export const LocationInput = ({ value, onChange }: LocationInputProps) => {
  return (
    <div className="space-y-1">
      <label htmlFor="location" className="text-base font-medium text-gray-700 flex items-center gap-2">
        <MapPin className="h-5 w-5" />
        Location
      </label>
      <Input
        id="location"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter location"
        required
        className="rounded-xl h-12"
      />
    </div>
  )
}
