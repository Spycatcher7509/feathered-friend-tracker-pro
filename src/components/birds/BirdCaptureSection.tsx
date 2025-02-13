
import { Loader2 } from "lucide-react"
import { BirdImageCapture } from "./BirdImageCapture"
import AudioRecorder from "./AudioRecorder"

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
  return (
    <div className="space-y-4">
      <BirdImageCapture
        onCameraCapture={onCameraCapture}
        onFileInput={onFileInput}
        isProcessing={isProcessing}
      />

      {soundUrl && (
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-2">Recorded bird call:</p>
          <audio controls className="w-full">
            <source src={soundUrl} type="audio/webm" />
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
    </div>
  )
}
