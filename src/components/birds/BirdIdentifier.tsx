
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Camera, Upload, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export function BirdIdentifier() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [predictions, setPredictions] = useState<any[] | null>(null)
  const { toast } = useToast()
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const handleImageUpload = async (file: File) => {
    try {
      setIsProcessing(true)
      setPredictions(null)

      // Create preview
      const objectUrl = URL.createObjectURL(file)
      setPreviewUrl(objectUrl)

      // Prepare form data
      const formData = new FormData()
      formData.append('image', file)

      // Call our edge function
      const { data, error } = await supabase.functions.invoke('identify-bird', {
        body: formData,
      })

      if (error) throw error

      setPredictions(data.result)
      
      // Clean up preview URL
      return () => URL.revokeObjectURL(objectUrl)
    } catch (error) {
      console.error('Error:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to identify bird. Please try again.",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      await handleImageUpload(file)
    }
  }

  const handleCameraCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      const video = document.createElement('video')
      video.srcObject = stream
      await video.play()

      // Create a canvas to capture the image
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Could not get canvas context')

      // Draw the video frame to the canvas
      ctx.drawImage(video, 0, 0)
      
      // Convert the canvas to a file
      canvas.toBlob(async (blob) => {
        if (blob) {
          const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' })
          await handleImageUpload(file)
        }
      }, 'image/jpeg')

      // Stop the video stream
      stream.getTracks().forEach(track => track.stop())
    } catch (error) {
      console.error('Error accessing camera:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not access camera. Please check your permissions.",
      })
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Camera className="h-4 w-4" />
          Identify Bird
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Identify Bird Species</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button
              onClick={handleCameraCapture}
              disabled={isProcessing}
              variant="outline"
              className="flex-1"
            >
              <Camera className="h-4 w-4 mr-2" />
              Use Camera
            </Button>
            
            <label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
                disabled={isProcessing}
              />
              <Button
                variant="outline"
                className="flex-1"
                asChild
              >
                <span>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Image
                </span>
              </Button>
            </label>
          </div>

          {previewUrl && (
            <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
              <img
                src={previewUrl}
                alt="Preview"
                className="h-full w-full object-cover"
              />
            </div>
          )}

          {isProcessing && (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <p>Analyzing image...</p>
            </div>
          )}

          {predictions && (
            <div className="space-y-2">
              <h3 className="font-semibold">Possible Matches:</h3>
              <div className="rounded-lg border p-4 space-y-2">
                {predictions.map((prediction: any, index: number) => (
                  <div key={index} className="flex justify-between">
                    <span>{prediction.label}</span>
                    <span className="text-gray-500">
                      {(prediction.score * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
