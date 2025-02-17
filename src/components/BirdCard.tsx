
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trash2, Camera, Mic, Upload } from "lucide-react"
import { useState } from "react"
import BirdImageSection from "./birds/cards/BirdImageSection"
import BirdAudioPlayer from "./birds/cards/BirdAudioPlayer"
import BirdDetailsDialog from "./birds/cards/BirdDetailsDialog"
import AudioRecorder from "./birds/AudioRecorder"

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
  const [isDeleting, setIsDeleting] = useState(false)
  const [isRecording, setIsRecording] = useState(false)

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && onImageUpload) {
      await onImageUpload(file)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow overflow-hidden"
    >
      <BirdImageSection
        image={image}
        name={name}
        isPersonal={isPersonal}
        onImageUpload={onImageUpload}
      />

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
        
        <div className="flex flex-wrap gap-2">
          <BirdDetailsDialog
            name={name}
            image={image}
            scientificName={scientificName}
            location={location}
            date={date}
            description={description}
            isOpen={isDetailsOpen}
            onOpenChange={setIsDetailsOpen}
          />

          <BirdAudioPlayer
            soundUrl={soundUrl}
            birdName={name}
          />

          {isPersonal && (
            <div className="flex gap-2">
              <label>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                >
                  <span>
                    <Camera className="h-4 w-4 mr-1" />
                    Upload Media
                  </span>
                </Button>
              </label>

              <AudioRecorder
                onRecordingComplete={(url) => {
                  console.log("Recording completed:", url)
                  // Handle the recording URL here
                }}
              />

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
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default BirdCard
