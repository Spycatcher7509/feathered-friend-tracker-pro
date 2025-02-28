
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
                    audioRef.current.src = url

                    // Load the new audio source
                    const loadPromise = new Promise<void>((resolve, reject) => {
                        if (audioRef.current) {
                            audioRef.current.onloadeddata = () => resolve()
                            audioRef.current.onerror = () => reject(new Error("Failed to load audio"))
                        }
                    })

                    audioRef.current.load()
                    await loadPromise

                    setAudioError(false)
                }
            } catch (error) {
                console.error("Error setting up audio:", error)
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

        return () => {
            isMounted = false
            if (audioRef.current) {
                audioRef.current.pause()
                audioRef.current.src = "" // Ensure cleanup
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
            console.error("Audio error:", e, audio.error)
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
        audio.addEventListener("error", handleError)

        return () => {
            audio.removeEventListener("timeupdate", updateTime)
            audio.removeEventListener("durationchange", handleDurationChange)
            audio.removeEventListener("ended", handleEnded)
            audio.removeEventListener("error", handleError)
        }
    }, [birdName, toast])

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume
        }
    }, [volume])

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
                await audioRef.current.play().catch(() => {
                    throw new Error("Playback failed due to browser restrictions")
                })
                setIsPlaying(true)
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
