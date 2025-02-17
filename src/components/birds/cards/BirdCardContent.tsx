
import BirdDetailsDialog from "./BirdDetailsDialog"
import BirdAudioPlayer from "./BirdAudioPlayer"
import BirdCardActions from "./BirdCardActions"
import BirdCardHeader from "./BirdCardHeader"

interface BirdCardContentProps {
  name: string
  scientificName?: string
  location: string
  date: string
  description?: string
  image: string
  soundUrl?: string
  isPersonal?: boolean
  onImageUpload?: (file: File) => Promise<void>
  onDelete?: () => Promise<void>
  isDeleting: boolean
  isDetailsOpen: boolean
  onOpenChange: (open: boolean) => void
}

const BirdCardContent = ({
  name,
  scientificName,
  location,
  date,
  description,
  image,
  soundUrl,
  isPersonal,
  onImageUpload,
  onDelete,
  isDeleting,
  isDetailsOpen,
  onOpenChange
}: BirdCardContentProps) => {
  return (
    <div className="p-4 space-y-2">
      <BirdCardHeader
        name={name}
        scientificName={scientificName}
        isPersonal={isPersonal}
      />
      
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
          onOpenChange={onOpenChange}
        />

        <BirdAudioPlayer
          soundUrl={soundUrl}
          birdName={name}
        />

        {isPersonal && (
          <BirdCardActions
            onImageUpload={onImageUpload}
            onDelete={onDelete}
            isDeleting={isDeleting}
          />
        )}
      </div>
    </div>
  )
}

export default BirdCardContent
