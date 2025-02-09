
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import BirdCard from "@/components/BirdCard"
import { ScrollArea } from "@/components/ui/scroll-area"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Globe, User } from "lucide-react"
import { useState } from "react"

const BirdSightingsList = () => {
  const [showGlobal, setShowGlobal] = useState(false)

  const { data: sightings, isLoading } = useQuery({
    queryKey: ["bird-sightings", showGlobal],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      const query = supabase
        .from("bird_sightings")
        .select("*")
        .order("created_at", { ascending: false })

      if (!showGlobal) {
        query.eq("user_id", user?.id)
      }
      
      const { data, error } = await query
      
      if (error) throw error
      
      return data.map(sighting => ({
        ...sighting,
        isPersonal: sighting.user_id === user?.id
      }))
    }
  })

  if (isLoading) {
    return <div className="text-center">Loading sightings...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-nature-800">
          {showGlobal ? "All Bird Sightings" : "My Bird Sightings"}
        </h2>
        <Button
          variant="outline"
          onClick={() => setShowGlobal(!showGlobal)}
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
      
      <ScrollArea className="h-[400px] rounded-md border p-4">
        {!sightings?.length ? (
          <div className="text-center text-gray-500">
            {showGlobal 
              ? "No bird sightings recorded yet."
              : "You haven't recorded any bird sightings yet."}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sightings.map((sighting) => (
              <BirdCard
                key={sighting.id}
                name={sighting.bird_name}
                location={sighting.location}
                date={format(new Date(sighting.created_at), "PPP")}
                image={sighting.image_url || "/placeholder.svg"}
                isPersonal={sighting.isPersonal}
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}

export default BirdSightingsList
