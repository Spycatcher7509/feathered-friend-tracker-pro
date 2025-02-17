
import { motion } from "framer-motion"
import { useState } from "react"
import BirdImageSection from "./birds/cards/BirdImageSection"
import BirdCardContent from "./birds/cards/BirdCardContent"

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

      <BirdCardContent
        name={name}
        scientificName={scientificName}
        location={location}
        date={date}
        description={description}
        image={image}
        soundUrl={soundUrl}
        isPersonal={isPersonal}
        onImageUpload={onImageUpload}
        onDelete={handleDelete}
        isDeleting={isDeleting}
        isDetailsOpen={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
      />
    </motion.div>
  )
}

export default BirdCard
