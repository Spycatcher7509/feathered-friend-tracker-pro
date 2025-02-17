
import { Input } from "@/components/ui/input"
import { BirdSpeciesManager } from "./BirdSpeciesManager"

interface BirdNameInputProps {
  value: string
  onChange: (value: string) => void
  suggestions?: { id: number; name: string }[]
}

export const BirdNameInput = ({ value, onChange, suggestions }: BirdNameInputProps) => {
  return (
    <div className="space-y-2">
      <label htmlFor="birdName" className="text-sm font-medium text-gray-700">
        Bird Name
      </label>
      <div className="relative">
        <Input
          id="birdName"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter bird name"
          required
          list="bird-suggestions"
        />
        <datalist id="bird-suggestions">
          {suggestions?.map(bird => (
            <option key={bird.id} value={bird.name} />
          ))}
        </datalist>
        <div className="absolute right-0 top-0">
          <BirdSpeciesManager />
        </div>
      </div>
    </div>
  )
}
