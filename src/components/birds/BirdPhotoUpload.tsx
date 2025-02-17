
import { Button } from "@/components/ui/button"
import { Upload } from "lucide-react"

interface BirdPhotoUploadProps {
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>
  imageUrl: string | null
  loading?: boolean
}

export const BirdPhotoUpload = ({ onUpload, imageUrl, loading }: BirdPhotoUploadProps) => {
  return (
    <div className="space-y-2">
      <div className="mt-1">
        <label className="cursor-pointer block">
          <input
            type="file"
            accept="image/*"
            onChange={onUpload}
            className="hidden"
            disabled={loading}
          />
          <Button 
            type="button" 
            variant="outline" 
            className="w-full rounded-xl h-12 border-2 border-dashed"
            disabled={loading}
          >
            <Upload className="h-5 w-5 mr-2" />
            Upload Photo
          </Button>
        </label>
        {imageUrl && (
          <div className="mt-4 relative w-full aspect-video rounded-xl overflow-hidden">
            <img 
              src={imageUrl} 
              alt="Bird sighting" 
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>
    </div>
  )
}
