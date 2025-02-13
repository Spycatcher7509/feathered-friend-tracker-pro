
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Info, Play, Upload, Trash2, VolumeOff } from "lucide-react"
import { useState, useRef } from "react"
import { useToast } from "@/hooks/use-toast"

interface BirdCardProps {
  image: string
  name: string
  scientificName?: string
  location: string
  date: string
  description?: string
  soundUrl?: string
  isPersonal?: boolean
  onImageUpload?: (file: File) => Promise<void>
  onDelete?: () => Promise<void>
}

const BirdCard = ({ 
  image, 
  name, 
  scientificName,
  location, 
  date, 
  description, 
  soundUrl, 
  isPersonal,
  onImageUpload,
  onDelete
}: BirdCardProps) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [audioError, setAudioError] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const { toast } = useToast()

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && onImageUpload) {
      await onImageUpload(file)
    }
  }

  const handleDelete = async () => {
    if (onDelete) {
      setIsDeleting(true)
      try {
        await onDelete()
      } finally {
        setIsDeleting(false)
      }
    }
  }

  const toggleAudio = () => {
    if (!soundUrl) {
      console.log('No sound URL provided for:', name)
      toast({
        variant: "destructive",
        title: "Error",
        description: "No audio recording available for this bird sighting.",
      })
      return
    }

    console.log('Attempting to play sound for:', name)
    console.log('Sound URL:', soundUrl)

    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        audioRef.current.play().catch(error => {
          console.error('Error playing audio:', error)
          console.error('Audio element error details:', {
            error: audioRef.current?.error,
            networkState: audioRef.current?.networkState,
            readyState: audioRef.current?.readyState
          })
          setAudioError(true)
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to play audio. The recording might be unavailable.",
          })
        })
      }
    }
  }

  const handleAudioLoad = () => {
    console.log('Audio loaded successfully for:', name)
    setAudioError(false)
  }

  const handleAudioError = () => {
    console.error('Audio load error for:', name)
    console.error('Audio element details:', {
      error: audioRef.current?.error,
      networkState: audioRef.current?.networkState,
      readyState: audioRef.current?.readyState,
      currentSrc: audioRef.current?.currentSrc
    })
    setAudioError(true)
    setIsPlaying(false)
    toast({
      variant: "destructive",
      title: "Error",
      description: "Failed to load audio recording.",
    })
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
          <div>
            <h3 className="text-lg font-semibold text-nature-800">{name}</h3>
            {scientificName && (
              <p className="text-sm italic text-gray-600">{scientificName}</p>
            )}
          </div>
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
                  {scientificName && (
                    <div>
                      <h4 className="font-semibold">Scientific Name</h4>
                      <p className="italic">{scientificName}</p>
                    </div>
                  )}
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
                className={audioError ? "text-destructive" : ""}
              >
                {audioError ? (
                  <>
                    <VolumeOff className="h-4 w-4 mr-1" />
                    Audio Unavailable
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-1" />
                    {isPlaying ? 'Stop' : 'Play Sound'}
                  </>
                )}
              </Button>
              <audio
                ref={audioRef}
                src={soundUrl}
                onEnded={() => setIsPlaying(false)}
                onPlay={() => setIsPlaying(true)}
                onError={handleAudioError}
                onLoadedData={handleAudioLoad}
                className="hidden"
              />
            </>
          )}

          {onDelete && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default BirdCard
