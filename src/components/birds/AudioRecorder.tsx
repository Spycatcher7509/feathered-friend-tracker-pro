import { useState, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Mic, Square, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

const AudioRecorder = ({ onRecordingComplete }: { onRecordingComplete: (blob: Blob) => void }) => {
  const [isRecording, setIsRecording] = useState(false)
  const [isPreparing, setIsPreparing] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const { toast } = useToast()

  const startRecording = async () => {
    try {
      setIsPreparing(true)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        onRecordingComplete(blob)
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setIsPreparing(false)
    } catch (error) {
      console.error('Error accessing microphone:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not access microphone. Please check your permissions.",
      })
      setIsPreparing(false)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  return (
    <div className="flex items-center gap-4">
      {!isRecording ? (
        <Button
          onClick={startRecording}
          disabled={isPreparing}
          variant="outline"
          className="bg-white"
        >
          {isPreparing ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Mic className="w-4 h-4 mr-2" />
          )}
          {isPreparing ? "Preparing..." : "Start Recording"}
        </Button>
      ) : (
        <Button
          onClick={stopRecording}
          variant="destructive"
        >
          <Square className="w-4 h-4 mr-2" />
          Stop Recording
        </Button>
      )}
    </div>
  )
}

export default AudioRecorder