
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"

export function BirdSpeciesManager() {
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()

  const { data: birdSpecies, isLoading } = useQuery({
    queryKey: ["bird-species", searchQuery],
    queryFn: async () => {
      let query = supabase
        .from("bird_species")
        .select("*")
        .order("name")

      if (searchQuery) {
        query = query.ilike("name", `%${searchQuery}%`)
      }

      const { data, error } = await query

      if (error) throw error
      return data
    }
  })

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Search className="h-4 w-4" />
          Browse Bird Species
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
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
          <ScrollArea className="h-[300px] rounded-md border p-4">
            {isLoading ? (
              <div className="text-center text-gray-500">Loading bird species...</div>
            ) : !birdSpecies?.length ? (
              <div className="text-center text-gray-500">No bird species found</div>
            ) : (
              <div className="space-y-2">
                {birdSpecies.map((species) => (
                  <div
                    key={species.id}
                    className="flex items-center justify-between rounded-lg border p-3 hover:bg-gray-50"
                  >
                    <div>
                      <h4 className="font-medium">{species.name}</h4>
                      {species.scientific_name && (
                        <p className="text-sm text-gray-500 italic">
                          {species.scientific_name}
                        </p>
                      )}
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
