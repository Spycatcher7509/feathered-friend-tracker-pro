import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Bird, MapPin } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import AudioRecorder from "./AudioRecorder"
import { BirdSpeciesManager } from "./BirdSpeciesManager"
import { useQuery } from "@tanstack/react-query"

const AddBirdSighting = () => {
  const [loading, setLoading] = useState(false)
  const [birdName, setBirdName] = useState("")
  const [location, setLocation] = useState("")
  const [description, setDescription] = useState("")
  const [soundUrl, setSoundUrl] = useState<string | null>(null)
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

      <div className="space-y-2">
        <label htmlFor="birdName" className="text-sm font-medium text-gray-700">
          Bird Name
        </label>
        <div className="relative">
          <Input
            id="birdName"
            value={birdName}
            onChange={(e) => setBirdName(e.target.value)}
            placeholder="Enter bird name"
            required
            list="bird-suggestions"
          />
          <datalist id="bird-suggestions">
            {birdSuggestions?.map(bird => (
              <option key={bird.id} value={bird.name} />
            ))}
          </datalist>
          <div className="absolute right-0 top-0">
            <BirdSpeciesManager />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="location" className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Location
        </label>
        <Input
          id="location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Enter location"
          required
        />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label htmlFor="description" className="text-sm font-medium text-gray-700">
            Description
          </label>
          <AudioRecorder
            mode="description"
            onRecordingComplete={(text) => setDescription(text)}
            className="flex-shrink-0"
          />
        </div>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add any notes about the sighting..."
          className="min-h-[100px]"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Bird Sound
        </label>
        <div className="mt-1">
          <AudioRecorder
            mode="bird-call"
            onRecordingComplete={(url) => {
              setSoundUrl(url)
              toast({
                title: "Success",
                description: "Bird sound recorded successfully!",
              })
            }}
          />
          {soundUrl && (
            <audio controls src={soundUrl} className="w-full mt-2" />
          )}
        </div>
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Recording..." : "Record Sighting"}
      </Button>
    </form>
  )
}

export default AddBirdSighting
