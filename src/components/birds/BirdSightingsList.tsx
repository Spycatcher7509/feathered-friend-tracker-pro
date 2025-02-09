
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import BirdCard from "@/components/BirdCard"
import { ScrollArea } from "@/components/ui/scroll-area"
import { format } from "date-fns"

const BirdSightingsList = () => {
  const { data: sightings, isLoading } = useQuery({
    queryKey: ["bird-sightings"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      const { data, error } = await supabase
        .from("bird_sightings")
        .select("*")
        .order("created_at", { ascending: false })
      
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

  if (!sightings?.length) {
    return <div className="text-center text-gray-500">No bird sightings recorded yet.</div>
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-nature-800">Recent Bird Sightings</h2>
      <ScrollArea className="h-[400px] rounded-md border p-4">
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
      </ScrollArea>
    </div>
  )
}

export default BirdSightingsList
