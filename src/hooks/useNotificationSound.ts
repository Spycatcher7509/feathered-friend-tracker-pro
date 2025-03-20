
import { useEffect, useRef } from 'react';

/**
 * Custom hook to manage notification sounds
 * 
 * This hook:
 * 1. Initializes an audio element with the provided sound path
 * 2. Provides a function to play the notification sound
 * 3. Properly cleans up resources when the component unmounts
 * 
 * @param {string} soundPath - Path to the notification sound file
 * @returns {Object} Object containing the playNotificationSound function
 */
export const useNotificationSound = (soundPath: string = '/notification.mp3') => {
  // Using a ref to store the Audio element without causing re-renders
  const notificationSound = useRef<HTMLAudioElement | null>(null);

  // Initialize notification sound
  useEffect(() => {
    // Create the Audio element when the hook is first used
    notificationSound.current = new Audio(soundPath);
    
    // Clean up the Audio element when the component unmounts
    return () => {
      if (notificationSound.current) {
        notificationSound.current.pause();
        notificationSound.current.src = "";
      }
    };
  }, [soundPath]);

  /**
   * Play the notification sound
   * Resets the playback position before playing to ensure it plays every time
   */
  const playNotificationSound = () => {
    if (notificationSound.current) {
      notificationSound.current.currentTime = 0;
      notificationSound.current.play()
        .catch(err => console.error("Error playing notification sound:", err));
    }
  };

  return { playNotificationSound };
};
