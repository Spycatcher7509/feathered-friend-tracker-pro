
import { Button } from "@/components/ui/button"
import { Camera, Upload } from "lucide-react"

interface BirdImageCaptureProps {
  onCameraCapture: () => Promise<void>
  onFileInput: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>
  isProcessing: boolean
}

export function BirdImageCapture({ onCameraCapture, onFileInput, isProcessing }: BirdImageCaptureProps) {
  return (
    <div className="flex gap-2">
      <Button
        onClick={onCameraCapture}
        disabled={isProcessing}
        variant="outline"
        className="flex-1"
      >
        <Camera className="h-4 w-4 mr-2" />
        Use Camera
      </Button>
      
      <label>
        <input
          type="file"
          accept="image/*"
          onChange={onFileInput}
          className="hidden"
          disabled={isProcessing}
        />
        <Button
          variant="outline"
          className="flex-1"
          asChild
        >
          <span>
            <Upload className="h-4 w-4 mr-2" />
            Upload Image
          </span>
        </Button>
      </label>
    </div>
  )
}
