
import { useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { sendDiscordWebhookMessage } from "@/utils/discord";
import { RefObject } from 'react';

type UseSupportSubscriptionsProps = {
  isAdmin: RefObject<boolean>;
  setHasPendingSupport: (value: boolean) => void;
  playNotificationSound: () => void;
};

/**
 * Custom hook for setting up real-time subscriptions to support-related database changes
 * 
 * This hook:
 * 1. Sets up Supabase real-time channels for conversations, messages, and issues
 * 2. Only initializes subscriptions for admin users
 * 3. Plays notification sounds and shows toasts when new support items arrive
 * 4. Optionally sends Discord notifications for new support requests
 * 5. Properly cleans up subscriptions when the component unmounts
 * 
 * The integration flow:
 * - When a user submits a support request, it gets added to the database
 * - This triggers the real-time subscription for admins
 * - Admins receive notifications and the UI updates to show pending support
 * 
 * @param {Object} props - Configuration for the subscriptions
 * @param {RefObject<boolean>} props.isAdmin - Reference to whether the current user is an admin
 * @param {Function} props.setHasPendingSupport - Function to update the pending support state
 * @param {Function} props.playNotificationSound - Function to play a notification sound
 */
export const useSupportSubscriptions = ({
  isAdmin,
  setHasPendingSupport,
  playNotificationSound
}: UseSupportSubscriptionsProps) => {
  const { toast } = useToast();

  useEffect(() => {
    // Only set up subscriptions for admin users
    if (!isAdmin.current) {
      console.log('Non-admin user, not setting up support subscriptions');
      return;
    }
    
    console.log('Setting up support request subscriptions for admin');
    
    // Listen for new conversations - channel 1
    const conversationsChannel = supabase
      .channel('admin_new_support_conversations')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'conversations'
        },
        (payload) => {
          console.log('New conversation detected:', payload);
          if (payload.new) {
            // Update UI state to show pending support
            setHasPendingSupport(true);
            
            // Play sound notification
            playNotificationSound();
            
            // Show toast notification
            toast({
              title: "New Support Request",
              description: "A user is requesting technical support",
              variant: "default",
            });
            
            // Optionally send Discord notification
            try {
              sendDiscordWebhookMessage("🚨 New support request received");
            } catch (e) {
              console.error("Failed to send Discord notification:", e);
            }
          }
        }
      )
      .subscribe((status) => {
        console.log('Admin conversations subscription status:', status);
      });
    
    // Listen for new messages - channel 2
    const messagesChannel = supabase
      .channel('admin_new_support_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          console.log('New message detected:', payload);
          if (payload.new && !payload.new.is_system_message) {
            // Update UI state to show pending support
            setHasPendingSupport(true);
            
            // Play sound notification
            playNotificationSound();
            
            // Show toast notification
            toast({
              title: "New Support Message",
              description: "A user has sent a new message in support chat",
              variant: "default",
            });
          }
        }
      )
      .subscribe((status) => {
        console.log('Admin messages subscription status:', status);
      });

    // Listen for new issues - channel 3
    const issuesChannel = supabase
      .channel('admin_new_issues')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'issues'
        },
        (payload) => {
          console.log('New issue detected:', payload);
          if (payload.new) {
            // Update UI state to show pending support
            setHasPendingSupport(true);
            
            // Play sound notification
            playNotificationSound();
            
            // Show toast notification
            toast({
              title: "New Issue Report",
              description: "A user has reported a new issue",
              variant: "default",
            });
          }
        }
      )
      .subscribe();

    // Clean up all subscriptions when component unmounts
    return () => {
      console.log('Cleaning up support request subscriptions');
      supabase.removeChannel(conversationsChannel);
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(issuesChannel);
    };
  }, [isAdmin, setHasPendingSupport, playNotificationSound, toast]);
};
