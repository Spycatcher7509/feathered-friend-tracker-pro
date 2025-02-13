
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Mic, Square, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"

interface AudioRecorderProps {
  onRecordingComplete?: (url: string) => void
  className?: string
}

const AudioRecorder = ({ onRecordingComplete, className = "" }: AudioRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const { toast } = useToast()

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
        await uploadAudio(audioBlob)
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

  const uploadAudio = async (blob: Blob) => {
    setIsUploading(true)
    try {
      const filename = `recording-${Date.now()}.webm`
      const { data, error } = await supabase.storage
        .from('bird-sounds')
        .upload(filename, blob)

      if (error) throw error

      if (data) {
        const { data: { publicUrl } } = supabase.storage
          .from('bird-sounds')
          .getPublicUrl(filename)

        onRecordingComplete?.(publicUrl)
        toast({
          title: "Success",
          description: "Audio recording uploaded successfully",
        })
      }
    } catch (error) {
      console.error('Error uploading audio:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to upload audio recording. Please try again.",
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {!isRecording ? (
        <Button
          type="button" // Added to prevent form submission
          onClick={startRecording}
          disabled={isUploading}
          variant="outline"
          size="icon"
        >
          <Mic className="h-4 w-4" />
        </Button>
      ) : (
        <Button
          type="button" // Added to prevent form submission
          onClick={stopRecording}
          variant="destructive"
          size="icon"
        >
          <Square className="h-4 w-4" />
        </Button>
      )}
      {isUploading && (
        <Loader2 className="h-4 w-4 animate-spin text-nature-600" />
      )}
    </div>
  )
}

export default AudioRecorder
