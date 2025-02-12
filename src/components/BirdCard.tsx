
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Info, Play, Upload } from "lucide-react"
import { useState } from "react"

interface BirdCardProps {
  image: string
  name: string
  location: string
  date: string
  description?: string
  soundUrl?: string
  isPersonal?: boolean
  onImageUpload?: (file: File) => Promise<void>
}

const BirdCard = ({ 
  image, 
  name, 
  location, 
  date, 
  description, 
  soundUrl, 
  isPersonal,
  onImageUpload 
}: BirdCardProps) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && onImageUpload) {
      await onImageUpload(file)
    }
  }

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow overflow-hidden"
    >
      <div className="aspect-w-16 aspect-h-9 relative">
        <img src={image} alt={name} className="h-48 w-full object-cover" />
        {isPersonal && onImageUpload && (
          <div className="absolute bottom-2 right-2">
            <label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <Button size="sm" variant="secondary" asChild>
                <span><Upload className="h-4 w-4 mr-1" /> Upload Image</span>
              </Button>
            </label>
          </div>
        )}
      </div>

      <div className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-nature-800">{name}</h3>
          {isPersonal && (
            <Badge variant="secondary" className="bg-nature-100 text-nature-800">
              My Sighting
            </Badge>
          )}
        </div>
        <p className="text-sm text-nature-600">{location}</p>
        <p className="text-xs text-nature-500">{date}</p>
        
        <div className="flex gap-2">
          <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Info className="h-4 w-4 mr-1" /> Details
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{name} Sighting Details</DialogTitle>
              </DialogHeader>
              <ScrollArea className="max-h-[60vh] mt-4">
                <div className="space-y-4">
                  <img src={image} alt={name} className="w-full rounded-lg" />
                  <div>
                    <h4 className="font-semibold">Location</h4>
                    <p>{location}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Date</h4>
                    <p>{date}</p>
                  </div>
                  {description && (
                    <div>
                      <h4 className="font-semibold">Description</h4>
                      <p className="text-sm text-gray-600">{description}</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>

          {soundUrl && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleAudio}
              >
                <Play className="h-4 w-4 mr-1" />
                {isPlaying ? 'Stop' : 'Play Sound'}
              </Button>
              <audio
                ref={audioRef}
                src={soundUrl}
                onEnded={() => setIsPlaying(false)}
                className="hidden"
              />
            </>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default BirdCard
