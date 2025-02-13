
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { BirdSpecies } from "./types/bird-species"

interface BirdSpeciesCardProps {
  species: BirdSpecies
  onDelete: (speciesId: string) => Promise<void>
}

export function BirdSpeciesCard({ species, onDelete }: BirdSpeciesCardProps) {
  return (
    <div className="flex gap-4 rounded-lg border p-4 hover:bg-gray-50">
      {species.image_url && (
        <div className="flex-shrink-0">
          <img
            src={species.image_url}
            alt={species.name}
            className="h-24 w-24 rounded-lg object-cover"
          />
        </div>
      )}
      <div className="flex-grow space-y-2">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-medium text-lg">{species.name}</h4>
            {species.scientific_name && (
              <p className="text-sm text-gray-500 italic">
                {species.scientific_name}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(species.id)}
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        
        {species.description && (
          <p className="text-sm text-gray-600">
            {species.description}
          </p>
        )}
        
        <div className="grid grid-cols-2 gap-2 text-sm">
          {species.habitat && (
            <div>
              <span className="font-medium">Habitat:</span> {species.habitat}
            </div>
          )}
          {species.size_range && (
            <div>
              <span className="font-medium">Size:</span> {species.size_range}
            </div>
          )}
          {species.conservation_status && (
            <div>
              <span className="font-medium">Conservation Status:</span>{' '}
              <span className={
                species.conservation_status.toLowerCase().includes('endangered')
                  ? 'text-red-600'
                  : species.conservation_status.toLowerCase().includes('vulnerable')
                  ? 'text-orange-600'
                  : 'text-green-600'
              }>
                {species.conservation_status}
              </span>
            </div>
          )}
          {species.seasonal_patterns && (
            <div>
              <span className="font-medium">Seasonal Patterns:</span> {species.seasonal_patterns}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
