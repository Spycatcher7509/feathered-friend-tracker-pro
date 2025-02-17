
import { Button } from "@/components/ui/button"
import { Camera, Trash2, Mic } from "lucide-react"
import AudioRecorder from "../AudioRecorder"

interface BirdCardActionsProps {
  onImageUpload?: (file: File) => Promise<void>
  onDelete?: () => Promise<void>
  isDeleting: boolean
}

const BirdCardActions = ({ onImageUpload, onDelete, isDeleting }: BirdCardActionsProps) => {
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && onImageUpload) {
      await onImageUpload(file)
    }
  }

  return (
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

      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-1"
      >
        <AudioRecorder
          onRecordingComplete={(url) => {
            console.log("Recording completed:", url)
            // Handle the recording URL here
          }}
          buttonChildren={<>
            <Mic className="h-4 w-4 mr-1" />
            Record Call
          </>}
        />
      </Button>

      {onDelete && (
        <Button
          variant="destructive"
          size="sm"
          onClick={onDelete}
          disabled={isDeleting}
        >
          <Trash2 className="h-4 w-4 mr-1" />
          {isDeleting ? 'Deleting...' : 'Delete'}
        </Button>
      )}
    </div>
  )
}

export default BirdCardActions
