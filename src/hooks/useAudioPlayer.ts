
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
    try {
      // If it's already a public URL, return as-is
      if (!url.includes('supabase.co/storage/v1/object/sign')) {
        return url
      }

      // Extract the filename from the signed URL
      const urlObj = new URL(url)
      const pathname = urlObj.pathname
      const matches = pathname.match(/bird_sounds\/(.+)$/)
      
      if (!matches || !matches[1]) {
        throw new Error('Invalid audio file URL format')
      }
      
      const filename = matches[1]
      
      // Get a fresh public URL
      const { data } = supabase
        .storage
        .from('bird_sounds')
        .getPublicUrl(filename)

      if (!data.publicUrl) {
        throw new Error('Could not generate public URL')
      }

      return data.publicUrl
    } catch (error) {
      console.error('Error processing audio URL:', error)
      throw error
    }
  }

  useEffect(() => {
    let isMounted = true
    
    const setupAudio = async () => {
      if (!soundUrl) return
      
      try {
        setAudioError(false)
        const url = await getAudioUrl(soundUrl)
        
        if (!isMounted) return
        
        if (audioRef.current) {
          audioRef.current.src = url
          audioRef.current.load()
        }
      } catch (error) {
        console.error('Error setting up audio:', error)
        if (isMounted) {
          setAudioError(true)
          toast({
            variant: "destructive",
            title: "Error",
            description: `Unable to load audio file for ${birdName}`,
          })
        }
      }
    }

    setIsPlaying(false)
    setCurrentTime(0)
    setDuration(0)
    setupAudio()

    return () => {
      isMounted = false
      if (audioRef.current) {
        audioRef.current.src = ''
      }
    }
  }, [soundUrl, birdName, toast])

  useEffect(() => {
    if (!audioRef.current) return

    const audio = audioRef.current
    
    const updateTime = () => setCurrentTime(audio.currentTime)
    const handleDurationChange = () => setDuration(audio.duration)
    const handleEnded = () => setIsPlaying(false)
    const handleError = (e: ErrorEvent) => {
      console.error('Audio error:', e)
      setAudioError(true)
      setIsPlaying(false)
      toast({
        variant: "destructive",
        title: "Audio Error",
        description: `Unable to play audio for ${birdName}`,
      })
    }
    
    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('durationchange', handleDurationChange)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('error', handleError)
    
    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('durationchange', handleDurationChange)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('error', handleError)
    }
  }, [audioRef, birdName, toast])

  const toggleAudio = async () => {
    if (!soundUrl || !audioRef.current) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No audio recording available",
      })
      return
    }

    try {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        await audioRef.current.play()
        setIsPlaying(true)
      }
    } catch (error) {
      console.error('Error playing audio:', error)
      setAudioError(true)
      setIsPlaying(false)
      toast({
        variant: "destructive",
        title: "Audio Error",
        description: `Unable to play audio for ${birdName}`,
      })
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
