
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
    
    // For full file system paths, extract just the filename
    if (url.includes('/Users/')) {
      const parts = url.split('/')
      const filename = parts[parts.length - 1]
      console.log('Extracted filename:', filename)
      const newUrl = `/audio-directory/${filename}`
      console.log('Converted to public path:', newUrl)
      return newUrl
    }
    
    // For Supabase URLs, handle with storage API
    if (url.includes('supabase.co')) {
      try {
        const filename = url.split('/').pop()
        if (!filename) throw new Error('Invalid file path')
        
        const { data, error } = await supabase
          .storage
          .from('bird_sounds')
          .download(filename)

        if (error) throw error
        return URL.createObjectURL(data)
      } catch (error) {
        console.error('Error downloading audio:', error)
        throw error
      }
    }
    
    return url
  }

  useEffect(() => {
    setIsPlaying(false)
    setAudioError(false)
    setCurrentTime(0)
    setDuration(0)

    let blobUrl: string | undefined

    if (soundUrl) {
      console.log('Processing audio URL:', soundUrl)
      getAudioUrl(soundUrl)
        .then(url => {
          console.log('Setting audio source to:', url)
          if (audioRef.current) {
            if (url.startsWith('blob:')) {
              blobUrl = url
            }
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
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl)
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
