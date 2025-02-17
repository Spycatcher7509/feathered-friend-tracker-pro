
import { Volume2 } from "lucide-react"
import AudioRecorder from "./AudioRecorder"

interface BirdSoundRecorderProps {
  onRecordingComplete: (url: string) => void
  soundUrl: string | null
}

export const BirdSoundRecorder = ({ onRecordingComplete, soundUrl }: BirdSoundRecorderProps) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
        <Volume2 className="h-4 w-4" />
        Bird Sound
      </label>
      <div className="mt-1 space-y-2">
        <AudioRecorder
          mode="bird-call"
          onRecordingComplete={onRecordingComplete}
        />
        {soundUrl && (
          <div className="mt-4 p-4 border rounded-md bg-gray-50">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Recorded Sound</h4>
            <audio 
              controls 
              src={soundUrl} 
              className="w-full focus:outline-none"
              style={{
                height: '40px',
                borderRadius: '8px',
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
