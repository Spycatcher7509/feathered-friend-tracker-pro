
import { Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface BirdActionButtonsProps {
  onSave: () => Promise<void>
  onCancel: () => void
}

export function BirdActionButtons({ onSave, onCancel }: BirdActionButtonsProps) {
  return (
    <div className="flex justify-end gap-2 pt-4">
      <Button variant="outline" onClick={onCancel}>
        <X className="h-4 w-4 mr-2" />
        Cancel
      </Button>
      <Button onClick={onSave}>
        <Save className="h-4 w-4 mr-2" />
        Save to Species
      </Button>
    </div>
  )
}
