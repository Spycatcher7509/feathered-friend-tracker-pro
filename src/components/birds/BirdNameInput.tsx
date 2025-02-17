
import { Input } from "@/components/ui/input"
import { BirdSpeciesManager } from "./BirdSpeciesManager"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"

interface BirdNameInputProps {
  value: string
  onChange: (value: string) => void
  suggestions?: { id: string; name: string }[]
}

export const BirdNameInput = ({ value, onChange, suggestions }: BirdNameInputProps) => {
  return (
    <div className="space-y-1">
      <label htmlFor="birdName" className="text-base font-medium text-gray-700">
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
          className="pr-[180px] rounded-xl h-12"
        />
        <div className="absolute right-1 top-1">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 hover:bg-gray-100"
          >
            <Search className="h-4 w-4" />
            Browse Bird Species
          </Button>
        </div>
        <datalist id="bird-suggestions">
          {suggestions?.map(bird => (
            <option key={bird.id} value={bird.name} />
          ))}
        </datalist>
      </div>
    </div>
  )
}
