
import { useState, useEffect } from "react"
import { format } from "date-fns"
import { useAdminGroups } from "@/hooks/useAdminGroups"
import { ScrollArea } from "@/components/ui/scroll-area"
import BirdCard from "@/components/BirdCard"
import BirdSearchHeader from "./BirdSearchHeader"
import { useBirdSearch } from "@/hooks/useBirdSearch"
import { useBirdSightings } from "@/hooks/useBirdSightings"
import { useBirdSightingActions } from "./BirdSightingActions"

const BirdSightingsList = () => {
  const [showGlobal, setShowGlobal] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isAdmin, setIsAdmin] = useState(false)
  const { checkAdminStatus } = useAdminGroups()

  useEffect(() => {
    const checkAdmin = async () => {
      const adminStatus = await checkAdminStatus()
      setIsAdmin(adminStatus)
    }
    checkAdmin()
  }, [])

  const { data: trendSpecies } = useBirdSearch(searchQuery)
  const { data: sightings, isLoading, refetch } = useBirdSightings(showGlobal, searchQuery, trendSpecies)
  const { handleImageUpload, handleDelete } = useBirdSightingActions(refetch)

  if (isLoading) {
    return <div className="text-center">Loading sightings...</div>
  }

  return (
    <div className="space-y-4">
      <BirdSearchHeader
        showGlobal={showGlobal}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onToggleGlobal={() => setShowGlobal(!showGlobal)}
      />
      
      <ScrollArea className="h-[400px] rounded-md border p-4">
        {!sightings?.length ? (
          <div className="text-center text-gray-500">
            {showGlobal 
              ? "No bird sightings found."
              : "You haven't recorded any bird sightings yet."}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sightings.map((sighting) => (
              <BirdCard
                key={sighting.id}
                name={sighting.bird_name}
                scientificName={sighting.scientificName}
                location={sighting.location}
                date={format(new Date(sighting.created_at), "PPP")}
                image={sighting.image_url || "/placeholder.svg"}
                description={sighting.description}
                soundUrl={sighting.sound_url}
                isPersonal={sighting.isPersonal}
                onImageUpload={
                  sighting.isPersonal 
                    ? (file) => handleImageUpload(sighting.id, file)
                    : undefined
                }
                onDelete={
                  sighting.isPersonal || isAdmin
                    ? () => handleDelete(sighting.id)
                    : undefined
                }
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}

export default BirdSightingsList
