import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Camera, Loader2, Save, X, Mic, Square } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { BirdImageCapture } from "./BirdImageCapture"
import { BirdPredictions } from "./BirdPredictions"
import { BirdMetadataForm } from "./BirdMetadataForm"
import { BirdMetadata, BirdPrediction } from "./types"
import { uploadAudio } from "@/utils/audio"

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
  const [isRecording, setIsRecording] = useState(false)
  const [soundUrl, setSoundUrl] = useState<string | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const { toast } = useToast()
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [metadata, setMetadata] = useState<BirdMetadata>(initialMetadata)

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)
      chunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' })
        try {
          const path = await uploadAudio(audioBlob)
          setSoundUrl(path)
          toast({
            title: "Success",
            description: "Audio recording saved successfully",
          })
        } catch (error) {
          console.error('Error uploading audio:', error)
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to save audio recording",
          })
        }
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorderRef.current.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Error accessing microphone:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not access microphone. Please check your permissions.",
      })
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

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
      
      // Check if bird species already exists
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
        // Update existing record
        const { error: updateError } = await supabase
          .from('bird_species')
          .update(birdData)
          .eq('id', existingBird.id)
          .select()
          .single()
        error = updateError
      } else {
        // Insert new record
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
      
      // Close the dialog and reset state
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
    if (isRecording) {
      stopRecording()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Camera className="h-4 w-4" />
          Identify Bird
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>Identify Bird Species</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(90vh-80px)] px-6 pb-6">
          <div className="space-y-4">
            <BirdImageCapture
              onCameraCapture={handleCameraCapture}
              onFileInput={handleFileInput}
              isProcessing={isProcessing}
            />

            <div className="flex justify-center">
              <Button
                variant={isRecording ? "destructive" : "outline"}
                onClick={isRecording ? stopRecording : startRecording}
                className="w-full"
              >
                {isRecording ? (
                  <>
                    <Square className="h-4 w-4 mr-2" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4 mr-2" />
                    Record Bird Call
                  </>
                )}
              </Button>
            </div>

            {soundUrl && (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">Recorded bird call:</p>
                <audio controls className="w-full">
                  <source src={`${supabase.storageUrl}/object/public/bird-sounds/${soundUrl}`} type="audio/webm" />
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}

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

            {predictions && <BirdPredictions predictions={predictions} />}

            {predictions && (
              <BirdMetadataForm
                metadata={metadata}
                defaultName={predictions[0].label}
                onChange={handleMetadataChange}
              />
            )}

            {predictions && (
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Save to Species
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
