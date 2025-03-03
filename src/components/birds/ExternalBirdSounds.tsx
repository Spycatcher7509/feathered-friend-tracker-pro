
import { useExternalBirdSounds, ExternalBirdSound } from "@/hooks/useExternalBirdSounds"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import BirdAudioPlayer from "./cards/BirdAudioPlayer"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

const ExternalBirdSounds = () => {
  const { data: birdSounds, isLoading, error } = useExternalBirdSounds()
  const [searchQuery, setSearchQuery] = useState("")

  const filteredSounds = birdSounds?.filter(sound => 
    sound.bird_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-6">Loading bird sounds...</div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    console.error("Error loading bird sounds:", error)
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-6 text-red-500">
            Error loading bird sounds. Please try again later.
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="mb-4 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            type="text"
            placeholder="Search bird sounds..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <ScrollArea className="h-[400px]">
          <div className="space-y-4">
            {!filteredSounds?.length ? (
              <div className="text-center py-6 text-gray-500">
                {searchQuery ? `No birds found matching "${searchQuery}"` : "No bird sounds available"}
              </div>
            ) : (
              filteredSounds.map((sound: ExternalBirdSound) => (
                <div key={sound.id} className="border rounded-md p-4">
                  <h3 className="text-lg font-semibold mb-2">{sound.bird_name}</h3>
                  <p className="text-sm text-gray-500 mb-2">Source: {sound.source}</p>
                  <BirdAudioPlayer soundUrl={sound.sound_url} birdName={sound.bird_name} />
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

export default ExternalBirdSounds
