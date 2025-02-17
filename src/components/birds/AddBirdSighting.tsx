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

        <form className="space-y-8">
          <BirdNameInput />
          <LocationInput />
          
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

          <DescriptionInput />

          <Button type="submit" className="w-full bg-[#223534] hover:bg-[#2a4241]">
            Submit Sighting
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
