import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Play, Pause } from "lucide-react"
import { useExternalBirdSounds, type ExternalBirdSound } from "@/hooks/useExternalBirdSounds"
import BirdSoundImporter from "./BirdSoundImporter"

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
    return <div>Loading bird sounds...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-nature-800">External Bird Sounds</h2>
        <BirdSoundImporter />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {birdSounds?.map((sound) => (
          <Card key={sound.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{sound.bird_name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">{sound.source}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePlayPause(sound)}
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
    </div>
  )
}

export default ExternalBirdSounds