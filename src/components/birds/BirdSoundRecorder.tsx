
import { Volume2 } from "lucide-react"
import AudioRecorder from "./AudioRecorder"

interface BirdSoundRecorderProps {
  onRecordingComplete: (url: string) => void
  soundUrl: string | null
}

export const BirdSoundRecorder = ({ onRecordingComplete, soundUrl }: BirdSoundRecorderProps) => {
  return (
    <div className="space-y-2">
      <label className="text-base font-medium text-gray-700 flex items-center gap-2">
        <Volume2 className="h-5 w-5" />
        Bird Sound
      </label>
      <div className="mt-1 space-y-4">
        <AudioRecorder
          mode="bird-call"
          onRecordingComplete={onRecordingComplete}
          className="w-full"
        />
        
        {soundUrl && (
          <div className="rounded-xl border bg-gray-50 p-3">
            <audio 
              controls 
              src={soundUrl}
              className="w-full"
            />
          </div>
        )}
      </div>
    </div>
  )
}
