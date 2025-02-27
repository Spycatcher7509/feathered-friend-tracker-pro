
import { Button } from "@/components/ui/button"
import { Play, VolumeOff, Pause } from "lucide-react"

interface AudioControlsProps {
  isPlaying: boolean
  audioError: boolean
  onTogglePlay: () => void
}

const AudioControls = ({ isPlaying, audioError, onTogglePlay }: AudioControlsProps) => {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onTogglePlay}
      className={`flex items-center justify-center h-10 w-10 rounded-full ${
        audioError ? "text-destructive" : ""
      } ${isPlaying ? "bg-gray-200" : ""}`}
    >
      {audioError ? (
        <VolumeOff className="h-5 w-5" />
      ) : (
        <>
          {isPlaying ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5" />
          )}
        </>
      )}
    </Button>
  )
}

export default AudioControls
