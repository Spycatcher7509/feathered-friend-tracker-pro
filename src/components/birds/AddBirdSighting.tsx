import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Bird, MapPin } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import AudioRecorder from "./AudioRecorder"

const AddBirdSighting = () => {
  const [loading, setLoading] = useState(false)
  const [birdName, setBirdName] = useState("")
  const [location, setLocation] = useState("")
  const [description, setDescription] = useState("")
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error("User not authenticated")
      }

      const { error } = await supabase
        .from("bird_sightings")
        .insert({
          bird_name: birdName,
          location,
          description,
          user_id: user.id,
          sighting_date: new Date().toISOString()
        })

      if (error) throw error

      toast({
        title: "Success",
        description: "Bird sighting recorded successfully!",
      })

      // Reset form
      setBirdName("")
      setLocation("")
      setDescription("")
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
        <Input
          id="birdName"
          value={birdName}
          onChange={(e) => setBirdName(e.target.value)}
          placeholder="Enter bird name"
          required
        />
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
        <label htmlFor="description" className="text-sm font-medium text-gray-700">
          Description
        </label>
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
          Record Bird Sound
        </label>
        <AudioRecorder
          onRecordingComplete={(url) => {
            console.log("Recording URL:", url)
            // Handle the recording URL as needed
          }}
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Recording..." : "Record Sighting"}
      </Button>
    </form>
  )
}

export default AddBirdSighting