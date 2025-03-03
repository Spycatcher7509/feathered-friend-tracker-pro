
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Camera } from "lucide-react"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { useBirdIdentification } from "./hooks/useBirdIdentification"
import { BirdIdentifierContent } from "./BirdIdentifierContent"

export function BirdIdentifier() {
  const [isOpen, setIsOpen] = useState(false)
  const {
    isProcessing,
    predictions,
    previewUrl,
    soundUrl,
    metadata,
    handleCameraCapture,
    handleFileInput,
    handleMetadataChange,
    handleSave,
    setSoundUrl
  } = useBirdIdentification()

  const handleCancel = () => {
    setIsOpen(false)
  }

  const handleSaveAndClose = async () => {
    const success = await handleSave()
    if (success) {
      setIsOpen(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Camera className="h-4 w-4" />
          Identify Birds
        </Button>
      </DialogTrigger>
      
      <BirdIdentifierContent
        isProcessing={isProcessing}
        predictions={predictions}
        previewUrl={previewUrl}
        soundUrl={soundUrl}
        metadata={metadata}
        onCameraCapture={handleCameraCapture}
        onFileInput={handleFileInput}
        onMetadataChange={handleMetadataChange}
        onSave={handleSaveAndClose}
        onCancel={handleCancel}
        setSoundUrl={setSoundUrl}
      />
    </Dialog>
  )
}
