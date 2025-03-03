
import { ScrollArea } from "@/components/ui/scroll-area"
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { BirdCaptureSection } from "./BirdCaptureSection"
import { BirdPredictions } from "./BirdPredictions"
import { BirdMetadataForm } from "./BirdMetadataForm"
import { BirdActionButtons } from "./BirdActionButtons"
import { BirdMetadata, BirdPrediction } from "./types"

interface BirdIdentifierContentProps {
  isProcessing: boolean
  predictions: BirdPrediction[] | null
  previewUrl: string | null
  soundUrl: string | null
  metadata: BirdMetadata
  onCameraCapture: () => Promise<void>
  onFileInput: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>
  onMetadataChange: (field: keyof BirdMetadata, value: string) => void
  onSave: () => Promise<boolean>
  onCancel: () => void
  setSoundUrl: (url: string | null) => void
}

export function BirdIdentifierContent({
  isProcessing,
  predictions,
  previewUrl,
  soundUrl,
  metadata,
  onCameraCapture,
  onFileInput,
  onMetadataChange,
  onSave,
  onCancel,
  setSoundUrl
}: BirdIdentifierContentProps) {
  return (
    <DialogContent className="sm:max-w-[600px] max-h-[90vh] p-0">
      <DialogHeader className="p-6 pb-0">
        <DialogTitle>Identify Bird Species</DialogTitle>
      </DialogHeader>
      <ScrollArea className="max-h-[calc(90vh-80px)] px-6 pb-6">
        <div className="space-y-4">
          <BirdCaptureSection
            onCameraCapture={onCameraCapture}
            onFileInput={onFileInput}
            isProcessing={isProcessing}
            previewUrl={previewUrl}
            soundUrl={soundUrl}
            setSoundUrl={setSoundUrl}
          />

          {predictions && <BirdPredictions predictions={predictions} />}

          {predictions && (
            <BirdMetadataForm
              metadata={metadata}
              defaultName={predictions[0].label}
              onChange={onMetadataChange}
            />
          )}

          {predictions && (
            <BirdActionButtons
              onSave={onSave}
              onCancel={onCancel}
            />
          )}
        </div>
      </ScrollArea>
    </DialogContent>
  )
}
