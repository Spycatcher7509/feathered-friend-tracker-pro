
import { Button } from "@/components/ui/button"
import { Play, VolumeOff, Pause, Volume2 } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { Slider } from "@/components/ui/slider"

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
    if (soundUrl && audioRef.current) {
      audioRef.current.load()
    }
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

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const toggleAudio = () => {
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
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        const playPromise = audioRef.current.play()
        
        if (playPromise !== undefined) {
          playPromise.then(() => {
            console.log('Audio playback started successfully')
            setIsPlaying(true)
          }).catch(error => {
            console.error('Error playing audio:', error)
            setAudioError(true)
            toast({
              variant: "destructive",
              title: "Audio Format Error",
              description: "This audio format is not supported by your browser. Please try a different recording.",
            })
          })
        }
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
    console.log('Audio loaded successfully for:', birdName, 'URL:', soundUrl)
    setAudioError(false)
  }

  const handleAudioError = (e: React.SyntheticEvent<HTMLAudioElement, Event>) => {
    const audioElement = e.currentTarget
    console.error('Audio load error for:', birdName)
    console.error('Audio src:', audioElement.src)
    console.error('Audio error code:', audioElement.error?.code)
    console.error('Audio error message:', audioElement.error?.message)
    setAudioError(true)
    setIsPlaying(false)
    toast({
      variant: "destructive",
      title: "Audio Error",
      description: "Unable to load audio. The file may be corrupted or in an unsupported format.",
    })
  }

  if (!soundUrl) return null

  return (
    <div className="rounded-xl border bg-gray-50 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleAudio}
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
          <div className="text-sm">
            {audioError ? (
              <span className="text-destructive">Audio Unavailable</span>
            ) : (
              <span className="text-gray-700">{formatTime(currentTime)} / {formatTime(duration)}</span>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Volume2 className="h-4 w-4 text-gray-500" />
          <Slider
            defaultValue={[1]}
            max={1}
            step={0.1}
            value={[volume]}
            onValueChange={handleVolumeChange}
            className="w-20"
          />
        </div>
      </div>

      {!audioError && (
        <Slider
          defaultValue={[0]}
          max={duration}
          step={1}
          value={[currentTime]}
          onValueChange={handleTimeChange}
          className="w-full"
        />
      )}

      <audio
        ref={audioRef}
        src={soundUrl}
        preload="metadata"
        onEnded={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        onError={handleAudioError}
        onLoadedData={handleAudioLoad}
      >
        <source src={soundUrl} type="audio/mpeg" />
        <source src={soundUrl} type="audio/wav" />
        <source src={soundUrl} type="audio/ogg" />
        Your browser does not support the audio element.
      </audio>
    </div>
  )
}

export default BirdAudioPlayer
