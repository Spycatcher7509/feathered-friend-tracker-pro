
import { useAudioPlayer } from "@/hooks/useAudioPlayer"
import AudioControls from "./audio-player/AudioControls"
import TimeDisplay from "./audio-player/TimeDisplay"
import VolumeControl from "./audio-player/VolumeControl"
import ProgressBar from "./audio-player/ProgressBar"
import AudioElement from "./audio-player/AudioElement"
import AudioPlayerLayout from "./audio-player/AudioPlayerLayout"

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
    audioRef,
    setCurrentTime,
    setVolume,
    setIsPlaying,
    setAudioError,
    toggleAudio,
  } = useAudioPlayer(soundUrl, birdName)

  const handleTimeChange = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0]
      setCurrentTime(value[0])
    }
  }

  const handleVolumeChange = (value: number[]) => {
    if (audioRef.current) {
      const newVolume = value[0]
      audioRef.current.volume = newVolume
      setVolume(newVolume)
    }
  }

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

      <AudioElement
        ref={audioRef}
        soundUrl=""
        onEnded={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        onError={() => setAudioError(true)}
        onLoadedData={() => setAudioError(false)}
      />
    </AudioPlayerLayout>
  )
}

export default BirdAudioPlayer
