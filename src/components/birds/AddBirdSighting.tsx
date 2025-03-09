
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { BirdNameInput } from "./BirdNameInput"
import { LocationInput } from "./LocationInput"
import { DescriptionInput } from "./DescriptionInput"
import { BirdCaptureSection } from "./BirdCaptureSection"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

export default function AddBirdSighting() {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [soundUrl, setSoundUrl] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [birdName, setBirdName] = useState("")
  const [location, setLocation] = useState("")
  const [description, setDescription] = useState("")
  const { toast } = useToast()

  const handleCameraCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      const video = document.createElement('video')
      const canvas = document.createElement('canvas')
      
      video.srcObject = stream
      await video.play()

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      canvas.getContext('2d')?.drawImage(video, 0, 0)

      stream.getTracks().forEach(track => track.stop())

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob)
        }, 'image/jpeg')
      })

      const filename = `capture-${Date.now()}.jpg`
      const { data, error } = await supabase.storage
        .from('bird-images')
        .upload(filename, blob)

      if (error) throw error

      if (data) {
        const { data: { publicUrl } } = supabase.storage
          .from('bird-images')
          .getPublicUrl(filename)
        
        setPreviewUrl(publicUrl)
      }
    } catch (error) {
      console.error('Error capturing image:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to capture image. Please try again.",
      })
    }
  }

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0]
      if (!file) return

      setIsProcessing(true)

      const filename = `upload-${Date.now()}-${file.name}`
      const { data, error } = await supabase.storage
        .from('bird-images')
        .upload(filename, file)

      if (error) throw error

      if (data) {
        const { data: { publicUrl } } = supabase.storage
          .from('bird-images')
          .getPublicUrl(filename)
        
        setPreviewUrl(publicUrl)
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to upload image. Please try again.",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!birdName || !location) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please provide at least the bird name and location.",
      });
      return;
    }

    try {
      setIsProcessing(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "You must be logged in to submit a sighting.",
        });
        return;
      }
      
      const { data, error } = await supabase
        .from('bird_sightings')
        .insert({
          bird_name: birdName,
          location,
          description,
          image_url: previewUrl,
          sound_url: soundUrl,
          user_id: user.id,
        })
        .select();

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Bird sighting recorded successfully!",
      });
      
      // Reset form
      setBirdName("");
      setLocation("");
      setDescription("");
      setPreviewUrl(null);
      setSoundUrl(null);
      
    } catch (error) {
      console.error('Error recording bird sighting:', error);
      toast({
        variant: "destructive",
        title: "Submission Error",
        description: "Failed to record your bird sighting. Please try again.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="pt-6 px-6">
        <div className="flex items-center mb-6">
          <img
            src="/lovable-uploads/6386f1ec-a4d5-4509-a570-cbba8009b261.png"
            alt="Bird icon"
            className="w-8 h-8 mr-3"
          />
          <h1 className="text-3xl font-bold text-nature-800">
            Record Bird Sighting
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <BirdNameInput 
            value={birdName}
            onChange={setBirdName}
          />
          <LocationInput 
            value={location}
            onChange={setLocation}
          />
          
          <div className="space-y-4">
            <label className="text-base font-medium text-gray-700 flex items-center gap-2">
              Bird Photo
            </label>
            <BirdCaptureSection
              onCameraCapture={handleCameraCapture}
              onFileInput={handleFileInput}
              isProcessing={isProcessing}
              previewUrl={previewUrl}
              soundUrl={soundUrl}
              setSoundUrl={setSoundUrl}
            />
          </div>

          <DescriptionInput 
            value={description}
            onChange={setDescription}
          />

          <Button 
            type="submit" 
            className="w-full bg-[#223534] hover:bg-[#2a4241]"
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : "Submit Sighting"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
