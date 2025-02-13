
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import BirdCard from "@/components/BirdCard"
import { ScrollArea } from "@/components/ui/scroll-area"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Globe, Search, User } from "lucide-react"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { useAdminGroups } from "@/hooks/useAdminGroups"
import { Input } from "@/components/ui/input"

const BirdSightingsList = () => {
  const [showGlobal, setShowGlobal] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isAdmin, setIsAdmin] = useState(false)
  const { toast } = useToast()
  const { checkAdminStatus } = useAdminGroups()

  useEffect(() => {
    const checkAdmin = async () => {
      const adminStatus = await checkAdminStatus()
      setIsAdmin(adminStatus)
    }
    checkAdmin()
  }, [])

  const { data: sightings, isLoading, refetch } = useQuery({
    queryKey: ["bird-sightings", showGlobal, searchQuery],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      let query = supabase
        .from("bird_sightings")
        .select(`
          *,
          bird_species (
            name,
            scientific_name
          )
        `)
        .order("created_at", { ascending: false })

      if (!showGlobal) {
        query = query.eq("user_id", user?.id)
      }

      if (searchQuery) {
        query = query.textSearch('search_text', searchQuery)
      }
      
      const { data, error } = await query
      
      if (error) throw error
      
      return data.map(sighting => ({
        ...sighting,
        isPersonal: sighting.user_id === user?.id,
        scientificName: sighting.bird_species?.scientific_name
      }))
    }
  })

  const handleImageUpload = async (sightingId: string, file: File) => {
    try {
      const fileExt = file.name.split('.').pop()
      const filePath = `${crypto.randomUUID()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('bird-images')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('bird-images')
        .getPublicUrl(filePath)

      const { error: updateError } = await supabase
        .from('bird_sightings')
        .update({ image_url: publicUrl })
        .eq('id', sightingId)

      if (updateError) throw updateError

      toast({
        title: "Success",
        description: "Image uploaded successfully",
      })

      refetch()
    } catch (error) {
      console.error('Error uploading image:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to upload image. Please try again.",
      })
    }
  }

  const handleDelete = async (sightingId: string) => {
    try {
      const { error } = await supabase
        .from('bird_sightings')
        .delete()
        .eq('id', sightingId)

      if (error) throw error

      toast({
        title: "Success",
        description: "Bird sighting deleted successfully",
      })

      refetch()
    } catch (error) {
      console.error('Error deleting sighting:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete sighting. Please try again.",
      })
    }
  }

  if (isLoading) {
    return <div className="text-center">Loading sightings...</div>
  }

  return (
    <div className="space-y-4">
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
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
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
      </div>
      
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
