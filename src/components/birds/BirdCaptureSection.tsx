
import { Loader2, Mic } from "lucide-react"
import { BirdImageCapture } from "./BirdImageCapture"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import BirdAudioPlayer from "./cards/BirdAudioPlayer"

interface BirdCaptureSectionProps {
  onCameraCapture: () => Promise<void>
  onFileInput: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>
  isProcessing: boolean
  previewUrl: string | null
  soundUrl: string | null
  setSoundUrl: (url: string | null) => void
}

export function BirdCaptureSection({
  onCameraCapture,
  onFileInput,
  isProcessing,
  previewUrl,
  soundUrl,
  setSoundUrl
}: BirdCaptureSectionProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const { toast } = useToast()

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      const chunks: Blob[] = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data)
        }
      }

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' })
        const filename = `recording-${Date.now()}.webm`
        
        try {
          const { data, error } = await supabase.storage
            .from('bird-sounds')
            .upload(filename, audioBlob)

          if (error) throw error

          if (data) {
            const { data: { publicUrl } } = supabase.storage
              .from('bird-sounds')
              .getPublicUrl(filename)

            setSoundUrl(publicUrl)
            
            // Send audio for bird sound matching
            const formData = new FormData()
            formData.append('audio', audioBlob)
            
            const { data: matchData, error: matchError } = await supabase.functions.invoke(
              'transcribe-audio',
              { body: { audio: await blobToBase64(audioBlob) } }
            )

            if (matchError) throw matchError

            toast({
              title: "Bird Sound Analysis",
              description: `Detected bird sound pattern: ${matchData.text}`,
            })
          }
        } catch (error) {
          console.error('Error processing audio:', error)
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to process audio recording. Please try again.",
          })
        }

        stream.getTracks().forEach(track => track.stop())
      }

      setMediaRecorder(recorder)
      recorder.start()
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
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop()
      setIsRecording(false)
      setMediaRecorder(null)
    }
  }

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        resolve(base64String)
      }
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <BirdImageCapture
          onCameraCapture={onCameraCapture}
          onFileInput={onFileInput}
          isProcessing={isProcessing}
        />
        <Button
          variant="outline"
          onClick={isRecording ? stopRecording : startRecording}
          className={`w-full ${isRecording ? "bg-red-100 hover:bg-red-200" : ""}`}
        >
          <Mic className={`h-4 w-4 mr-2 ${isRecording ? "text-red-500" : ""}`} />
          {isRecording ? "Stop Recording" : "Record Bird Call"}
        </Button>
      </div>

      {soundUrl && (
        <BirdAudioPlayer
          soundUrl={soundUrl}
          birdName="Bird Recording"
        />
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
    </div>
  )
}
