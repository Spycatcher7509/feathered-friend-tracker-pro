
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
    return (
      <audio
        ref={ref}
        src={soundUrl}
        preload="metadata"
        onEnded={onEnded}
        onPlay={onPlay}
        onError={onError}
        onLoadedData={onLoadedData}
      >
        <source src={soundUrl} type="audio/mpeg" />
        <source src={soundUrl} type="audio/wav" />
        <source src={soundUrl} type="audio/ogg" />
        Your browser does not support the audio element.
      </audio>
    )
  }
)

AudioElement.displayName = 'AudioElement'

export default AudioElement
