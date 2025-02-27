
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
    console.log('Original URL:', url)
    
    // For Supabase storage URLs, get the public URL
    if (url.includes('supabase.co')) {
      try {
        const pathParts = url.split('bird_sounds/')
        if (pathParts.length !== 2) throw new Error('Invalid Supabase storage URL')
        
        const filename = pathParts[1]
        console.log('Extracted filename from Supabase URL:', filename)
        
        const { data: { publicUrl } } = supabase
          .storage
          .from('bird_sounds')
          .getPublicUrl(filename)
        
        console.log('Generated public URL:', publicUrl)
        return publicUrl
      } catch (error) {
        console.error('Error processing Supabase URL:', error)
        throw error
      }
    }
    
    // For all other URLs, return as-is
    return url
  }

  useEffect(() => {
    setIsPlaying(false)
    setAudioError(false)
    setCurrentTime(0)
    setDuration(0)

    if (soundUrl) {
      console.log('Processing audio URL:', soundUrl)
      getAudioUrl(soundUrl)
        .then(url => {
          console.log('Setting audio source to:', url)
          if (audioRef.current) {
            audioRef.current.src = url
            audioRef.current.load() // Force reload of audio
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

    return () => {
      if (audioRef.current) {
        audioRef.current.src = ''
      }
    }
  }, [soundUrl, birdName, toast])

  useEffect(() => {
    if (audioRef.current) {
      const audio = audioRef.current
      
      const updateTime = () => setCurrentTime(audio.currentTime)
      const handleDurationChange = () => setDuration(audio.duration)
      const handleError = () => {
        console.error('Audio error occurred:', audio.error)
        setAudioError(true)
        setIsPlaying(false)
        toast({
          variant: "destructive",
          title: "Audio Error",
          description: `Unable to play audio for ${birdName}. The file may be corrupted or unavailable.`,
        })
      }
      
      audio.addEventListener('timeupdate', updateTime)
      audio.addEventListener('durationchange', handleDurationChange)
      audio.addEventListener('error', handleError)
      
      return () => {
        audio.removeEventListener('timeupdate', updateTime)
        audio.removeEventListener('durationchange', handleDurationChange)
        audio.removeEventListener('error', handleError)
      }
    }
  }, [birdName, toast])

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
          console.log('Attempting to play:', audioRef.current.src)
          const playPromise = audioRef.current.play()
          if (playPromise !== undefined) {
            await playPromise
            setIsPlaying(true)
            console.log('Audio playback started successfully')
          }
        }
      } catch (error) {
        console.error('Error playing audio:', error)
        setAudioError(true)
        setIsPlaying(false)
        toast({
          variant: "destructive",
          title: "Audio Error",
          description: `Unable to play audio for ${birdName}. Please try again.`,
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
