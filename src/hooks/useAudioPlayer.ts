
import { useState, useRef, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"

export const useAudioPlayer = (soundUrl: string | undefined, birdName: string) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioError, setAudioError] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const { toast } = useToast()

  const getAudioUrl = async (url: string) => {
    if (url.includes('supabase.co')) {
      try {
        const filePath = url.split('bird_sounds/')[1]
        if (!filePath) throw new Error('Invalid file path')
        
        const { data: { signedUrl }, error } = await supabase
          .storage
          .from('bird_sounds')
          .createSignedUrl(filePath, 3600)

        if (error) throw error
        return signedUrl
      } catch (error) {
        console.error('Error creating signed URL:', error)
        throw error
      }
    }
    
    const parts = url.split(/[\/\\]/)
    const filename = parts[parts.length - 1]
    return `/audio-directory/${filename}`
  }

  useEffect(() => {
    setIsPlaying(false)
    setAudioError(false)
    setCurrentTime(0)
    setDuration(0)

    if (soundUrl) {
      getAudioUrl(soundUrl)
        .then(url => {
          if (audioRef.current) {
            audioRef.current.src = url
          }
        })
        .catch(error => {
          console.error('Error setting audio URL:', error)
          setAudioError(true)
          toast({
            variant: "destructive",
            title: "Error",
            description: `Unable to load audio file for ${birdName}`,
          })
        })
    }
  }, [soundUrl, birdName, toast])

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
      toast({
        variant: "destructive",
        title: "Error",
        description: "No audio recording available for this bird sighting.",
      })
      return
    }

    if (audioRef.current) {
      try {
        if (isPlaying) {
          audioRef.current.pause()
          setIsPlaying(false)
        } else {
          const playPromise = audioRef.current.play()
          if (playPromise !== undefined) {
            await playPromise
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

  return {
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
  }
}
