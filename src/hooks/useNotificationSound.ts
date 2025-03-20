
import { useEffect, useRef } from 'react';

export const useNotificationSound = (soundPath: string = '/notification.mp3') => {
  const notificationSound = useRef<HTMLAudioElement | null>(null);

  // Initialize notification sound
  useEffect(() => {
    notificationSound.current = new Audio(soundPath);
    
    return () => {
      if (notificationSound.current) {
        notificationSound.current.pause();
        notificationSound.current.src = "";
      }
    };
  }, [soundPath]);

  // Play notification sound
  const playNotificationSound = () => {
    if (notificationSound.current) {
      notificationSound.current.currentTime = 0;
      notificationSound.current.play()
        .catch(err => console.error("Error playing notification sound:", err));
    }
  };

  return { playNotificationSound };
};
