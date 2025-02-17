
import { Button } from "@/components/ui/button"
import { Image, Upload } from "lucide-react"

interface BirdPhotoUploadProps {
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>
  imageUrl: string | null
  loading?: boolean
}

export const BirdPhotoUpload = ({ onUpload, imageUrl, loading }: BirdPhotoUploadProps) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
        <Image className="h-4 w-4" />
        Bird Photo
      </label>
      <div className="mt-1 space-y-2">
        <div className="flex items-center gap-2">
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={onUpload}
              className="hidden"
              disabled={loading}
            />
            <Button type="button" variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Upload Photo
            </Button>
          </label>
        </div>
        {imageUrl && (
          <div className="relative w-full aspect-video">
            <img 
              src={imageUrl} 
              alt="Bird sighting" 
              className="w-full h-full object-cover rounded-md"
            />
          </div>
        )}
      </div>
    </div>
  )
}
