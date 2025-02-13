
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Camera } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { BirdPredictions } from "./BirdPredictions"
import { BirdMetadataForm } from "./BirdMetadataForm"
import { BirdMetadata, BirdPrediction } from "./types"
import { BirdCaptureSection } from "./BirdCaptureSection"
import { BirdActionButtons } from "./BirdActionButtons"

const initialMetadata: BirdMetadata = {
  name: '',
  scientific_name: '',
  description: '',
  habitat: '',
  size_range: '',
  conservation_status: '',
  seasonal_patterns: ''
}

export function BirdIdentifier() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [predictions, setPredictions] = useState<BirdPrediction[] | null>(null)
  const [soundUrl, setSoundUrl] = useState<string | null>(null)
  const { toast } = useToast()
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [metadata, setMetadata] = useState<BirdMetadata>(initialMetadata)

  const handleImageUpload = async (file: File) => {
    try {
      setIsProcessing(true)
      setPredictions(null)

      const objectUrl = URL.createObjectURL(file)
      setPreviewUrl(objectUrl)

      const formData = new FormData()
      formData.append('image', file)

      const { data, error } = await supabase.functions.invoke('identify-bird', {
        body: formData,
      })

      if (error) throw error

      setPredictions(data.result)
      
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

      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Could not get canvas context')

      ctx.drawImage(video, 0, 0)
      
      canvas.toBlob(async (blob) => {
        if (blob) {
          const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' })
          await handleImageUpload(file)
        }
      }, 'image/jpeg')

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

  const handleMetadataChange = (field: keyof BirdMetadata, value: string) => {
    setMetadata(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    if (!predictions || predictions.length === 0) return

    try {
      const topPrediction = predictions[0]
      const birdName = metadata.name || topPrediction.label
      
      const { data: existingBird } = await supabase
        .from('bird_species')
        .select()
        .ilike('name', birdName)
        .maybeSingle()

      const birdData = {
        ...metadata,
        name: birdName,
        image_url: previewUrl || null,
        sound_url: soundUrl || null,
      }

      let error
      if (existingBird) {
        const { error: updateError } = await supabase
          .from('bird_species')
          .update(birdData)
          .eq('id', existingBird.id)
          .select()
          .single()
        error = updateError
      } else {
        const { error: insertError } = await supabase
          .from('bird_species')
          .insert(birdData)
          .select()
          .single()
        error = insertError
      }

      if (error) throw error

      toast({
        title: "Success",
        description: existingBird 
          ? "Bird species updated successfully" 
          : "Bird species saved successfully",
      })
      
      handleCancel()
    } catch (error) {
      console.error('Error saving bird species:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save bird species. Please try again.",
      })
    }
  }

  const handleCancel = () => {
    setIsOpen(false)
    setPredictions(null)
    setPreviewUrl(null)
    setSoundUrl(null)
    setMetadata(initialMetadata)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Camera className="h-4 w-4" />
          Identify Birds
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>Identify Bird Species</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(90vh-80px)] px-6 pb-6">
          <div className="space-y-4">
            <BirdCaptureSection
              onCameraCapture={handleCameraCapture}
              onFileInput={handleFileInput}
              isProcessing={isProcessing}
              previewUrl={previewUrl}
              soundUrl={soundUrl}
              setSoundUrl={setSoundUrl}
            />

            {predictions && <BirdPredictions predictions={predictions} />}

            {predictions && (
              <BirdMetadataForm
                metadata={metadata}
                defaultName={predictions[0].label}
                onChange={handleMetadataChange}
              />
            )}

            {predictions && (
              <BirdActionButtons
                onSave={handleSave}
                onCancel={handleCancel}
              />
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
