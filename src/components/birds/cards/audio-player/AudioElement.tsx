
import { forwardRef, useEffect } from 'react'

interface AudioElementProps {
  soundUrl: string
  onEnded: () => void
  onPlay: () => void
  onError: (e: React.SyntheticEvent<HTMLAudioElement, Event>) => void
  onLoadedData: () => void
}

const AudioElement = forwardRef<HTMLAudioElement, AudioElementProps>(
  ({ soundUrl, onEnded, onPlay, onError, onLoadedData }, ref) => {
    // Verify URL on mount and when it changes
    useEffect(() => {
      if (soundUrl) {
        // Test URL validity
        fetch(soundUrl, { method: 'HEAD' })
          .catch(() => {
            console.error('Audio URL is not accessible:', soundUrl)
          })
      }
    }, [soundUrl])

    return (
      <audio
        ref={ref}
        preload="metadata"
        onEnded={onEnded}
        onPlay={onPlay}
        onError={onError}
        onLoadedData={onLoadedData}
      >
        {/* Try different audio formats and fallbacks */}
        <source src={soundUrl} type="audio/mpeg" />
        <source src={soundUrl.replace('.mp3', '.wav')} type="audio/wav" />
        <source src={soundUrl.replace('.mp3', '.ogg')} type="audio/ogg" />
        <source src={soundUrl} type="audio/webm" />
        Your browser does not support the audio element.
      </audio>
    )
  }
)

AudioElement.displayName = 'AudioElement'

export default AudioElement
