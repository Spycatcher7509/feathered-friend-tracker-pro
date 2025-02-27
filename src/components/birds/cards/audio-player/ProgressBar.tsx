
import { Slider } from "@/components/ui/slider"

interface ProgressBarProps {
  currentTime: number
  duration: number
  onTimeChange: (value: number[]) => void
}

const ProgressBar = ({ currentTime, duration, onTimeChange }: ProgressBarProps) => {
  return (
    <Slider
      defaultValue={[0]}
      max={duration}
      step={1}
      value={[currentTime]}
      onValueChange={onTimeChange}
      className="w-full"
    />
  )
}

export default ProgressBar
