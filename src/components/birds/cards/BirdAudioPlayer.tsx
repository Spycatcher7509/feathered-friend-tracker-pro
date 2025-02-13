
import { Button } from "@/components/ui/button"
import { Play, VolumeOff } from "lucide-react"
import { useState, useRef } from "react"
import { useToast } from "@/hooks/use-toast"

interface BirdAudioPlayerProps {
  soundUrl?: string
  birdName: string
}

const BirdAudioPlayer = ({ soundUrl, birdName }: BirdAudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioError, setAudioError] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const { toast } = useToast()

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

    console.log('Attempting to play sound for:', birdName)
    console.log('Sound URL:', soundUrl)

    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        audioRef.current.play().catch(error => {
          console.error('Error playing audio:', error)
          console.error('Audio element error details:', {
            error: audioRef.current?.error,
            networkState: audioRef.current?.networkState,
            readyState: audioRef.current?.readyState
          })
          setAudioError(true)
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to play audio. The recording might be unavailable.",
          })
        })
      }
    }
  }

  const handleAudioLoad = () => {
    console.log('Audio loaded successfully for:', birdName)
    setAudioError(false)
  }

  const handleAudioError = () => {
    console.error('Audio load error for:', birdName)
    console.error('Audio element details:', {
      error: audioRef.current?.error,
      networkState: audioRef.current?.networkState,
      readyState: audioRef.current?.readyState,
      currentSrc: audioRef.current?.currentSrc
    })
    setAudioError(true)
    setIsPlaying(false)
    toast({
      variant: "destructive",
      title: "Error",
      description: "Failed to load audio recording.",
    })
  }

  if (!soundUrl) return null

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={toggleAudio}
        className={audioError ? "text-destructive" : ""}
      >
        {audioError ? (
          <>
            <VolumeOff className="h-4 w-4 mr-1" />
            Audio Unavailable
          </>
        ) : (
          <>
            <Play className="h-4 w-4 mr-1" />
            {isPlaying ? 'Stop' : 'Play Sound'}
          </>
        )}
      </Button>
      <audio
        ref={audioRef}
        src={soundUrl}
        onEnded={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        onError={handleAudioError}
        onLoadedData={handleAudioLoad}
        className="hidden"
      />
    </>
  )
}

export default BirdAudioPlayer
