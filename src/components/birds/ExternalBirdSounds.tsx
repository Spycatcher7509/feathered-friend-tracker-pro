import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Play, Pause } from "lucide-react"
import { useExternalBirdSounds, type ExternalBirdSound } from "@/hooks/useExternalBirdSounds"

const ExternalBirdSounds = () => {
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null)
  const { data: birdSounds, isLoading } = useExternalBirdSounds()

  const handlePlayPause = (sound: ExternalBirdSound) => {
    if (playingId === sound.id) {
      audioRef?.pause()
      setAudioRef(null)
      setPlayingId(null)
    } else {
      if (audioRef) {
        audioRef.pause()
      }
      const audio = new Audio(sound.sound_url)
      audio.play()
      setAudioRef(audio)
      setPlayingId(sound.id)
      
      audio.onended = () => {
        setPlayingId(null)
        setAudioRef(null)
      }
    }
  }

  if (isLoading) {
    return <div className="text-center">Loading bird sounds...</div>
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {birdSounds?.map((sound) => (
        <Card key={sound.id} className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-nature-800">
              {sound.bird_name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-sm text-nature-600">Source: {sound.source}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePlayPause(sound)}
                className="bg-nature-50 hover:bg-nature-100"
              >
                {playingId === sound.id ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default ExternalBirdSounds