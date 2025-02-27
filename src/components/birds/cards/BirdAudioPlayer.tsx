
import { useState, useRef, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import AudioControls from "./audio-player/AudioControls"
import TimeDisplay from "./audio-player/TimeDisplay"
import VolumeControl from "./audio-player/VolumeControl"
import ProgressBar from "./audio-player/ProgressBar"
import AudioElement from "./audio-player/AudioElement"

interface BirdAudioPlayerProps {
  soundUrl?: string
  birdName: string
}

const BirdAudioPlayer = ({ soundUrl, birdName }: BirdAudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioError, setAudioError] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    // Reset states when sound URL changes
    setIsPlaying(false)
    setAudioError(false)
    setCurrentTime(0)
    setDuration(0)
  }, [soundUrl])

  useEffect(() => {
    if (audioRef.current) {
      const audio = audioRef.current
      
      const updateTime = () => setCurrentTime(audio.currentTime)
      const handleDurationChange = () => setDuration(audio.duration)
      
      audio.addEventListener('timeupdate', updateTime)
      audio.addEventListener('durationchange', handleDurationChange)
      
      return () => {
        audio.removeEventListener('timeupdate', updateTime)
        audio.removeEventListener('durationchange', handleDurationChange)
      }
    }
  }, [])

  const toggleAudio = async () => {
    if (!soundUrl) {
      console.log('No sound URL provided for:', birdName)
      toast({
        variant: "destructive",
        title: "Error",
        description: "No audio recording available for this bird sighting.",
      })
      return
    }

    console.log('Attempting to play audio:', soundUrl)

    if (audioRef.current) {
      try {
        if (isPlaying) {
          audioRef.current.pause()
          setIsPlaying(false)
        } else {
          const playPromise = audioRef.current.play()
          if (playPromise !== undefined) {
            await playPromise
            console.log('Audio playback started successfully')
            setIsPlaying(true)
          }
        }
      } catch (error) {
        console.error('Error playing audio:', error)
        setAudioError(true)
        setIsPlaying(false)
        toast({
          variant: "destructive",
          title: "Audio Error",
          description: `Unable to play audio for ${birdName}. The file may be unavailable.`,
        })
      }
    }
  }

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

  const handleAudioLoad = () => {
    console.log('Audio loaded successfully for:', birdName)
    setAudioError(false)
  }

  const handleAudioError = (e: React.SyntheticEvent<HTMLAudioElement, Event>) => {
    const audioElement = e.currentTarget
    console.error('Audio load error for:', birdName)
    console.error('Audio src:', audioElement.src)
    console.error('Audio error:', audioElement.error)
    setAudioError(true)
    setIsPlaying(false)
    toast({
      variant: "destructive",
      title: "Audio Error",
      description: `Unable to load audio for ${birdName}. Please check if the file exists.`,
    })
  }

  if (!soundUrl) return null

  return (
    <div className="rounded-xl border bg-gray-50 p-4 space-y-4">
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
        soundUrl={soundUrl}
        onEnded={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        onError={handleAudioError}
        onLoadedData={handleAudioLoad}
      />
    </div>
  )
}

export default BirdAudioPlayer
