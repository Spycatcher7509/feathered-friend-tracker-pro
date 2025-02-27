
import { forwardRef } from 'react'

interface AudioElementProps {
  onEnded: () => void
  onPlay: () => void
  onError: (e: React.SyntheticEvent<HTMLAudioElement, Event>) => void
  onLoadedData: () => void
}

const AudioElement = forwardRef<HTMLAudioElement, AudioElementProps>(
  ({ onEnded, onPlay, onError, onLoadedData }, ref) => {
    return (
      <audio
        ref={ref}
        preload="metadata"
        onEnded={onEnded}
        onPlay={onPlay}
        onError={onError}
        onLoadedData={onLoadedData}
      />
    )
  }
)

AudioElement.displayName = 'AudioElement'

export default AudioElement
