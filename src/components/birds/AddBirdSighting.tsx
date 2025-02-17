
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Bird } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useQuery } from "@tanstack/react-query"
import { BirdNameInput } from "./BirdNameInput"
import { LocationInput } from "./LocationInput"
import { BirdPhotoUpload } from "./BirdPhotoUpload"
import { BirdSoundRecorder } from "./BirdSoundRecorder"
import { DescriptionInput } from "./DescriptionInput"

const AddBirdSighting = () => {
  const [loading, setLoading] = useState(false)
  const [birdName, setBirdName] = useState("")
  const [location, setLocation] = useState("")
  const [description, setDescription] = useState("")
  const [soundUrl, setSoundUrl] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const { toast } = useToast()

  const { data: birdSuggestions } = useQuery({
    queryKey: ["bird-species-suggestions", birdName],
    queryFn: async () => {
      if (!birdName) return []
      
      const { data, error } = await supabase
        .from("bird_species")
        .select("id, name")
        .ilike("name", `%${birdName}%`)
        .limit(5)

      if (error) throw error
      return data
    },
    enabled: birdName.length > 0
  })

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setLoading(true)
      const fileExt = file.name.split('.').pop()
      const filePath = `${crypto.randomUUID()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('bird-photos')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('bird-photos')
        .getPublicUrl(filePath)

      setImageUrl(publicUrl)
      toast({
        title: "Success",
        description: "Bird photo uploaded successfully!",
      })
    } catch (error) {
      console.error('Error uploading photo:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to upload photo. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error("User not authenticated")
      }

      const { data: species } = await supabase
        .from("bird_species")
        .select("id")
        .ilike("name", birdName)
        .maybeSingle()

      let speciesId = species?.id
      if (!species) {
        const { data: newSpecies, error: speciesError } = await supabase
          .from("bird_species")
          .insert({ name: birdName })
          .select("id")
          .single()

        if (speciesError) throw speciesError
        speciesId = newSpecies.id
      }

      const { error } = await supabase
        .from("bird_sightings")
        .insert({
          bird_name: birdName,
          species_id: speciesId,
          location,
          description,
          sound_url: soundUrl,
          image_url: imageUrl,
          user_id: user.id,
          sighting_date: new Date().toISOString()
        })

      if (error) throw error

      toast({
        title: "Success",
        description: "Bird sighting recorded successfully!",
      })

      setBirdName("")
      setLocation("")
      setDescription("")
      setSoundUrl(null)
      setImageUrl(null)
    } catch (error) {
      console.error("Error:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to record bird sighting. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-semibold text-nature-800 flex items-center gap-2">
        <Bird className="h-6 w-6" />
        Record Bird Sighting
      </h2>

      <BirdNameInput
        value={birdName}
        onChange={setBirdName}
        suggestions={birdSuggestions}
      />

      <LocationInput
        value={location}
        onChange={setLocation}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <BirdPhotoUpload
          onUpload={handleImageUpload}
          imageUrl={imageUrl}
          loading={loading}
        />

        <BirdSoundRecorder
          onRecordingComplete={(url) => {
            setSoundUrl(url)
            toast({
              title: "Success",
              description: "Bird sound recorded successfully!",
            })
          }}
          soundUrl={soundUrl}
        />
      </div>

      <DescriptionInput
        value={description}
        onChange={setDescription}
      />

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Recording..." : "Record Sighting"}
      </Button>
    </form>
  )
}

export default AddBirdSighting
