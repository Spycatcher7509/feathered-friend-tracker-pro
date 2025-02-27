
import { Volume2 } from "lucide-react"
import { Slider } from "@/components/ui/slider"

interface VolumeControlProps {
  volume: number
  onVolumeChange: (value: number[]) => void
}

const VolumeControl = ({ volume, onVolumeChange }: VolumeControlProps) => {
  return (
    <div className="flex items-center gap-2">
      <Volume2 className="h-4 w-4 text-gray-500" />
      <Slider
        defaultValue={[1]}
        max={1}
        step={0.1}
        value={[volume]}
        onValueChange={onVolumeChange}
        className="w-20"
      />
    </div>
  )
}

export default VolumeControl
