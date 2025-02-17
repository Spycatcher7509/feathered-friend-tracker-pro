
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  onSearch: () => void
}

export function SearchBar({ value, onChange, onSearch }: SearchBarProps) {
  return (
    <div className="flex gap-2">
      <Input
        placeholder="Search by email, username, location..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onSearch()}
        className="max-w-sm"
      />
      <Button onClick={onSearch}>
        <Search className="h-4 w-4 mr-1" />
        Search
      </Button>
    </div>
  )
}
