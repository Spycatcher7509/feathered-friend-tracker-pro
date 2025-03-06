
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { BirdMetadata, BirdPrediction } from "../types"

export const initialMetadata: BirdMetadata = {
  name: '',
  scientific_name: '',
  description: '',
  habitat: '',
  size_range: '',
  conservation_status: '',
  seasonal_patterns: ''
}

export function useBirdIdentification() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [predictions, setPredictions] = useState<BirdPrediction[] | null>(null)
  const [soundUrl, setSoundUrl] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [metadata, setMetadata] = useState<BirdMetadata>(initialMetadata)
  const { toast } = useToast()

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

  const handleSave = async (): Promise<boolean> => {
    if (!predictions || predictions.length === 0) return false

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
      
      // Reset state
      setPredictions(null)
      setPreviewUrl(null)
      setSoundUrl(null)
      setMetadata(initialMetadata)
      
      return true
    } catch (error) {
      console.error('Error saving bird species:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save bird species. Please try again.",
      })
      return false
    }
  }

  return {
    isProcessing,
    predictions,
    previewUrl,
    soundUrl,
    metadata,
    handleCameraCapture,
    handleFileInput,
    handleMetadataChange,
    handleSave,
    setSoundUrl
  }
}
