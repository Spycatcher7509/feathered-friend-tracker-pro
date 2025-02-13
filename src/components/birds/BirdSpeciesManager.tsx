
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Search } from "lucide-react"
import { BirdSpeciesCard } from "./BirdSpeciesCard"
import { useBirdSpecies } from "./hooks/useBirdSpecies"

export function BirdSpeciesManager() {
  const [searchQuery, setSearchQuery] = useState("")
  const { birdSpecies, isLoading, handleDelete } = useBirdSpecies(searchQuery)

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Search className="h-4 w-4" />
          Browse Bird Species
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[725px]">
        <DialogHeader>
          <DialogTitle>Bird Species Directory</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Search bird species..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
          <ScrollArea className="h-[400px] rounded-md border p-4">
            {isLoading ? (
              <div className="text-center text-gray-500">Loading bird species...</div>
            ) : !birdSpecies?.length ? (
              <div className="text-center text-gray-500">
                {searchQuery ? "No bird species found" : "Start typing to search for bird species"}
              </div>
            ) : (
              <div className="space-y-4">
                {birdSpecies.map((species) => (
                  <BirdSpeciesCard
                    key={species.id}
                    species={species}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}
