
import { forwardRef } from 'react'

interface AudioElementProps {
  soundUrl: string
  onEnded: () => void
  onPlay: () => void
  onError: (e: React.SyntheticEvent<HTMLAudioElement, Event>) => void
  onLoadedData: () => void
}

const AudioElement = forwardRef<HTMLAudioElement, AudioElementProps>(
  ({ soundUrl, onEnded, onPlay, onError, onLoadedData }, ref) => {
    if (!soundUrl) return null

    return (
      <audio
        ref={ref}
        preload="metadata"
        onEnded={onEnded}
        onPlay={onPlay}
        onError={onError}
        onLoadedData={onLoadedData}
        src={soundUrl}
      />
    )
  }
)

AudioElement.displayName = 'AudioElement'

export default AudioElement
