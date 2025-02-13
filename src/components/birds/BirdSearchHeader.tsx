
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Globe, Search, User } from "lucide-react"

interface BirdSearchHeaderProps {
  showGlobal: boolean
  searchQuery: string
  onSearchChange: (query: string) => void
  onToggleGlobal: () => void
}

const BirdSearchHeader = ({
  showGlobal,
  searchQuery,
  onSearchChange,
  onToggleGlobal
}: BirdSearchHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <h2 className="text-2xl font-semibold text-nature-800">
        {showGlobal ? "All Bird Sightings" : "My Bird Sightings"}
      </h2>
      <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
        <div className="relative flex-1 md:flex-initial">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            type="text"
            placeholder="Search birds..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button
          variant="outline"
          onClick={onToggleGlobal}
          className="gap-2"
        >
          {showGlobal ? (
            <>
              <User className="h-4 w-4" />
              Show My Sightings
            </>
          ) : (
            <>
              <Globe className="h-4 w-4" />
              Show All Sightings
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

export default BirdSearchHeader
