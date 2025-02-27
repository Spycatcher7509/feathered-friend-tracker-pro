
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronDown, ChevronUp } from "lucide-react"
import { useExternalBirdSounds, type ExternalBirdSound } from "@/hooks/useExternalBirdSounds"
import BirdSoundImporter from "./BirdSoundImporter"
import BirdAudioPlayer from "./cards/BirdAudioPlayer"

const ExternalBirdSounds = () => {
  const [showSounds, setShowSounds] = useState(false)
  const { data: birdSounds, isLoading } = useExternalBirdSounds()

  if (isLoading) {
    return <div>Loading bird sounds...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={() => setShowSounds(!showSounds)}
          className="w-full flex justify-between items-center py-6"
        >
          <span className="text-xl font-semibold">External Bird Sounds</span>
          {showSounds ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
        </Button>
        <BirdSoundImporter />
      </div>

      {showSounds && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {birdSounds?.map((sound) => (
            <Card key={sound.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{sound.bird_name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <span className="text-sm text-muted-foreground">{sound.source}</span>
                  <BirdAudioPlayer
                    soundUrl={sound.sound_url}
                    birdName={sound.bird_name}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default ExternalBirdSounds
