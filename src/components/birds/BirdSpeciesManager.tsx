
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Search } from "lucide-react"

interface BirdSpecies {
  id: string
  name: string
  scientific_name: string | null
  description: string | null
  image_url: string | null
  habitat: string | null
  size_range: string | null
  conservation_status: string | null
  seasonal_patterns: string | null
}

export function BirdSpeciesManager() {
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()

  const { data: birdSpecies, isLoading, error } = useQuery({
    queryKey: ["bird-species", searchQuery],
    queryFn: async () => {
      console.log("Searching for:", searchQuery)
      const query = supabase
        .from("bird_species")
        .select("*")
        
      if (searchQuery) {
        query.or(`name.ilike.%${searchQuery.toLowerCase()}%,scientific_name.ilike.%${searchQuery.toLowerCase()}%`)
      }
      
      const { data, error } = await query.order("name")

      if (error) {
        console.error("Supabase error:", error)
        throw error
      }
      
      console.log("Search results:", data)
      return data as BirdSpecies[]
    }
  })

  if (error) {
    toast({
      title: "Error",
      description: "Failed to load bird species",
      variant: "destructive",
    })
  }

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
                  <div
                    key={species.id}
                    className="flex gap-4 rounded-lg border p-4 hover:bg-gray-50"
                  >
                    {species.image_url && (
                      <div className="flex-shrink-0">
                        <img
                          src={species.image_url}
                          alt={species.name}
                          className="h-24 w-24 rounded-lg object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-grow space-y-2">
                      <div>
                        <h4 className="font-medium text-lg">{species.name}</h4>
                        {species.scientific_name && (
                          <p className="text-sm text-gray-500 italic">
                            {species.scientific_name}
                          </p>
                        )}
                      </div>
                      
                      {species.description && (
                        <p className="text-sm text-gray-600">
                          {species.description}
                        </p>
                      )}
                      
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {species.habitat && (
                          <div>
                            <span className="font-medium">Habitat:</span> {species.habitat}
                          </div>
                        )}
                        {species.size_range && (
                          <div>
                            <span className="font-medium">Size:</span> {species.size_range}
                          </div>
                        )}
                        {species.conservation_status && (
                          <div>
                            <span className="font-medium">Conservation Status:</span>{' '}
                            <span className={
                              species.conservation_status.toLowerCase().includes('endangered')
                                ? 'text-red-600'
                                : species.conservation_status.toLowerCase().includes('vulnerable')
                                ? 'text-orange-600'
                                : 'text-green-600'
                            }>
                              {species.conservation_status}
                            </span>
                          </div>
                        )}
                        {species.seasonal_patterns && (
                          <div>
                            <span className="font-medium">Seasonal Patterns:</span> {species.seasonal_patterns}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}
