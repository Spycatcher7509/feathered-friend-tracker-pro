
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Mic, Square, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"

interface AudioRecorderProps {
  onRecordingComplete?: (url: string) => void
  mode?: 'bird-call' | 'description'
  className?: string
  buttonChildren?: React.ReactNode
}

const AudioRecorder = ({ onRecordingComplete, mode = 'bird-call', className = "", buttonChildren }: AudioRecorderProps) => {
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
        if (mode === 'description') {
          await handleDescriptionRecording(audioBlob)
        } else {
          await uploadAudio(audioBlob)
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

  const handleDescriptionRecording = async (blob: Blob) => {
    setIsUploading(true)
    try {
      // Convert blob to base64
      const buffer = await blob.arrayBuffer()
      const base64Audio = btoa(String.fromCharCode(...new Uint8Array(buffer)))

      // Call the transcribe-audio function
      const { data, error } = await supabase.functions.invoke('transcribe-audio', {
        body: { audio: `data:audio/webm;base64,${base64Audio}` }
      })

      if (error) throw error

      if (data.text) {
        onRecordingComplete?.(data.text)
        toast({
          title: "Success",
          description: "Description transcribed successfully!",
        })
      }
    } catch (error) {
      console.error('Error transcribing audio:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to transcribe audio. Please try typing instead.",
      })
    } finally {
      setIsUploading(false)
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

  const buttonText = mode === 'description' ? 'Record description' : 'Record Bird Call'

  return (
    <div className={className}>
      {!isRecording ? (
        <Button
          variant="outline"
          className="w-full h-12 rounded-xl border-2 border-dashed gap-2"
          onClick={startRecording}
          disabled={isUploading}
        >
          <Mic className="h-5 w-5" />
          {mode === 'description' ? 'Record description' : 'Record Bird Call'}
        </Button>
      ) : (
        <Button
          variant="destructive"
          className="w-full h-12 rounded-xl gap-2"
          onClick={stopRecording}
        >
          <Square className="h-5 w-5" />
          Stop Recording
        </Button>
      )}
      {isUploading && (
        <div className="flex justify-center mt-2">
          <Loader2 className="h-4 w-4 animate-spin text-nature-600" />
        </div>
      )}
    </div>
  )
}

export default AudioRecorder
