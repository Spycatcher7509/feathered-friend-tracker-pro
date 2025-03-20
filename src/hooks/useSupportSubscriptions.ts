
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

export const useSupportSubscriptions = ({
  isAdmin,
  setHasPendingSupport,
  playNotificationSound
}: UseSupportSubscriptionsProps) => {
  const { toast } = useToast();

  useEffect(() => {
    if (!isAdmin.current) {
      console.log('Non-admin user, not setting up support subscriptions');
      return;
    }
    
    console.log('Setting up support request subscriptions for admin');
    
    // Listen for new conversations
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
            setHasPendingSupport(true);
            playNotificationSound();
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
    
    // Listen for new messages
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
            setHasPendingSupport(true);
            playNotificationSound();
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

    // Listen for new issues
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
            setHasPendingSupport(true);
            playNotificationSound();
            toast({
              title: "New Issue Report",
              description: "A user has reported a new issue",
              variant: "default",
            });
          }
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up support request subscriptions');
      supabase.removeChannel(conversationsChannel);
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(issuesChannel);
    };
  }, [isAdmin, setHasPendingSupport, playNotificationSound, toast]);
};
