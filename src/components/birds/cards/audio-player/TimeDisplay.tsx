
interface TimeDisplayProps {
  currentTime: number
  duration: number
  audioError: boolean
}

const TimeDisplay = ({ currentTime, duration, audioError }: TimeDisplayProps) => {
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="text-sm">
      {audioError ? (
        <span className="text-destructive">Audio Unavailable</span>
      ) : (
        <span className="text-gray-700">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      )}
    </div>
  )
}

export default TimeDisplay
