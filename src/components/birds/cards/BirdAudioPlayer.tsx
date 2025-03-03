
import { useAudioPlayer } from "@/hooks/useAudioPlayer"
import AudioControls from "./audio-player/AudioControls"
import TimeDisplay from "./audio-player/TimeDisplay"
import VolumeControl from "./audio-player/VolumeControl"
import ProgressBar from "./audio-player/ProgressBar"
import AudioPlayerLayout from "./audio-player/AudioPlayerLayout"
import { useEffect } from "react"

interface BirdAudioPlayerProps {
  soundUrl?: string
  birdName: string
}

const BirdAudioPlayer = ({ soundUrl, birdName }: BirdAudioPlayerProps) => {
  const {
    isPlaying,
    audioError,
    currentTime,
    duration,
    volume,
    setCurrentTime,
    setVolume,
    toggleAudio,
  } = useAudioPlayer(soundUrl, birdName)

  const handleTimeChange = (value: number[]) => {
    setCurrentTime(value[0])
  }

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0])
  }

  // Log for debugging
  useEffect(() => {
    if (soundUrl) {
      console.log(`BirdAudioPlayer for ${birdName} initialized with soundUrl:`, soundUrl)
    }
  }, [soundUrl, birdName])

  if (!soundUrl) return null

  return (
    <AudioPlayerLayout showProgress={!audioError}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <AudioControls
            isPlaying={isPlaying}
            audioError={audioError}
            onTogglePlay={toggleAudio}
          />
          <TimeDisplay
            currentTime={currentTime}
            duration={duration}
            audioError={audioError}
          />
        </div>
        <VolumeControl
          volume={volume}
          onVolumeChange={handleVolumeChange}
        />
      </div>

      {!audioError && (
        <ProgressBar
          currentTime={currentTime}
          duration={duration}
          onTimeChange={handleTimeChange}
        />
      )}
    </AudioPlayerLayout>
  )
}

export default BirdAudioPlayer
