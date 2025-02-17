
import { Badge } from "@/components/ui/badge"

interface BirdCardHeaderProps {
  name: string
  scientificName?: string
  isPersonal?: boolean
}

const BirdCardHeader = ({ name, scientificName, isPersonal }: BirdCardHeaderProps) => {
  return (
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
  )
}

export default BirdCardHeader
