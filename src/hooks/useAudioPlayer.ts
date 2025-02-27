
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
      // If it's not a Supabase URL, return as-is
      if (!url.includes('supabase.co')) {
        return url
      }

      // Get the filename from the URL
      const filename = url.split('/').pop()
      if (!filename) {
        throw new Error('Invalid URL format')
      }

      // Get a public URL for the file
      const { data } = supabase
        .storage
        .from('bird_sounds')
        .getPublicUrl(filename)

      if (!data.publicUrl) {
        throw new Error('Failed to get public URL')
      }

      // Add cache-busting parameter to prevent caching issues
      const cacheBuster = `?t=${Date.now()}`
      return `${data.publicUrl}${cacheBuster}`
    } catch (error) {
      console.error('Error getting audio URL:', error)
      throw error
    }
  }

  useEffect(() => {
    let isMounted = true

    const setupAudio = async () => {
      if (!soundUrl) return

      try {
        const url = await getAudioUrl(soundUrl)
        
        if (!isMounted) return

        if (audioRef.current) {
          // Reset audio state
          audioRef.current.pause()
          audioRef.current.currentTime = 0
          
          // Set new source and load
          audioRef.current.src = url
          audioRef.current.load()
          
          setAudioError(false)
        }
      } catch (error) {
        console.error('Error setting up audio:', error)
        if (isMounted) {
          setAudioError(true)
          toast({
            variant: "destructive",
            title: "Error",
            description: `Unable to load audio for ${birdName}`,
          })
        }
      }
    }

    setupAudio()
    setIsPlaying(false)
    setCurrentTime(0)
    setDuration(0)

    return () => {
      isMounted = false
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ''
        audioRef.current.load()
      }
    }
  }, [soundUrl, birdName, toast])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const handleDurationChange = () => setDuration(audio.duration)
    const handleEnded = () => setIsPlaying(false)
    const handleError = (e: ErrorEvent) => {
      console.error('Audio error:', e, audio.error)
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
