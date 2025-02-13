
import { Button } from "@/components/ui/button"
import { Upload } from "lucide-react"

interface BirdImageSectionProps {
  image: string
  name: string
  isPersonal?: boolean
  onImageUpload?: (file: File) => Promise<void>
}

const BirdImageSection = ({ image, name, isPersonal, onImageUpload }: BirdImageSectionProps) => {
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && onImageUpload) {
      await onImageUpload(file)
    }
  }

  return (
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
  )
}

export default BirdImageSection
