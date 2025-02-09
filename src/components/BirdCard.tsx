
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"

interface BirdCardProps {
  image: string
  name: string
  location: string
  date: string
  isPersonal?: boolean
}

const BirdCard = ({ image, name, location, date, isPersonal }: BirdCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow overflow-hidden"
    >
      <div className="aspect-w-16 aspect-h-9">
        <img src={image} alt={name} className="h-48 w-full object-cover" />
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
      </div>
    </motion.div>
  )
}

export default BirdCard
