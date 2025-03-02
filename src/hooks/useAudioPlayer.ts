
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"

export const useAudioPlayer = (soundUrl: string | undefined, birdName: string) => {
    const [isPlaying, setIsPlaying] = useState(false)
    const [audioError, setAudioError] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [volume, setVolume] = useState(1)
    const [audio] = useState<HTMLAudioElement>(() => {
        const element = new Audio()
        element.preload = "metadata"
        element.crossOrigin = "anonymous"
        return element
    })
    const { toast } = useToast()

    const getAudioUrl = async (url: string) => {
        try {
            if (!url.includes("supabase.co")) {
                return url // Return as-is if not a Supabase URL
            }

            // Extract filename
            const filename = url.split("/").pop()
            if (!filename) {
                throw new Error("Invalid URL format")
            }

            // Get public URL from Supabase
            const { data } = supabase.storage.from("bird_sounds").getPublicUrl(filename)
            const publicUrl = data?.publicUrl

            if (!publicUrl) {
                throw new Error("Failed to get public URL")
            }

            return `${publicUrl}?t=${Date.now()}` // Add cache-busting parameter
        } catch (error) {
            console.error("Error getting audio URL:", error)
            throw error
        }
    }

    // Set up event listeners once on mount
    useEffect(() => {
        // Set up audio element properties
        audio.volume = volume

        // Set up event listeners
        const updateTime = () => setCurrentTime(audio.currentTime)
        const handleDurationChange = () => setDuration(audio.duration)
        const handleEnded = () => setIsPlaying(false)
        const handleLoadedData = () => setAudioError(false)
        const handleError = () => {
            console.error("Audio error:", audio.error)
            setAudioError(true)
            setIsPlaying(false)
            toast({
                variant: "destructive",
                title: "Audio Error",
                description: `Unable to play audio for ${birdName}`,
            })
        }

        audio.addEventListener("timeupdate", updateTime)
        audio.addEventListener("durationchange", handleDurationChange)
        audio.addEventListener("ended", handleEnded)
        audio.addEventListener("loadeddata", handleLoadedData)
        audio.addEventListener("error", handleError)

        return () => {
            audio.removeEventListener("timeupdate", updateTime)
            audio.removeEventListener("durationchange", handleDurationChange)
            audio.removeEventListener("ended", handleEnded)
            audio.removeEventListener("loadeddata", handleLoadedData)
            audio.removeEventListener("error", handleError)
            audio.pause()
            audio.src = ""
        }
    }, [audio, birdName, toast, volume])

    // Handle sound URL changes
    useEffect(() => {
        if (!soundUrl) return

        const setupAudio = async () => {
            try {
                const url = await getAudioUrl(soundUrl)
                
                // Reset player state
                setIsPlaying(false)
                setCurrentTime(0)
                setDuration(0)
                
                // Reset and load audio
                audio.pause()
                audio.currentTime = 0
                audio.src = url
                audio.load()
                
            } catch (error) {
                console.error("Error setting up audio:", error)
                setAudioError(true)
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: `Unable to load audio for ${birdName}`,
                })
            }
        }

        setupAudio()
        
        return () => {
            audio.pause()
            audio.src = ""
        }
    }, [soundUrl, birdName, toast, audio])

    // Update volume when it changes
    useEffect(() => {
        audio.volume = volume
    }, [volume, audio])

    const toggleAudio = async () => {
        if (!soundUrl) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "No audio recording available",
            })
            return
        }

        try {
            if (isPlaying) {
                audio.pause()
                setIsPlaying(false)
            } else {
                try {
                    await audio.play()
                    setIsPlaying(true)
                } catch (error) {
                    console.error("Play error:", error)
                    throw error
                }
            }
        } catch (error) {
            console.error("Error playing audio:", error)
            setAudioError(true)
            setIsPlaying(false)
            toast({
                variant: "destructive",
                title: "Audio Error",
                description: `Unable to play audio for ${birdName}`,
            })
        }
    }

    const setAudioTime = (time: number) => {
        audio.currentTime = time
        setCurrentTime(time)
    }

    const setAudioVolume = (newVolume: number) => {
        audio.volume = newVolume
        setVolume(newVolume)
    }

    return {
        isPlaying,
        audioError,
        currentTime,
        duration,
        volume,
        setCurrentTime: setAudioTime,
        setVolume: setAudioVolume,
        setIsPlaying,
        setAudioError,
        toggleAudio,
    }
}
