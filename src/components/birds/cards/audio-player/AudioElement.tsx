
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
      if (!soundUrl) {
        console.error('No sound URL provided')
        onError({ currentTarget: { src: '', error: new Error('No URL provided') } } as React.SyntheticEvent<HTMLAudioElement, Event>)
        return
      }

      // Test URL validity
      fetch(soundUrl, { method: 'HEAD' })
        .then(response => {
          if (!response.ok) {
            throw new Error(`Failed to fetch audio: ${response.status}`)
          }
          console.log('Audio URL is valid:', soundUrl)
        })
        .catch((error) => {
          console.error('Audio URL is not accessible:', soundUrl, error)
          onError({ currentTarget: { src: soundUrl, error } } as React.SyntheticEvent<HTMLAudioElement, Event>)
        })
    }, [soundUrl, onError])

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
