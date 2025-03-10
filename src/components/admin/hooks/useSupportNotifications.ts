
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useSupportNotifications(
  setHasPendingSupport: (value: boolean) => void
) {
  const { toast } = useToast();

  const subscribeToSupportRequests = () => {
    console.log('Setting up support request subscription');
    
    // Listen for new conversations
    const conversationsChannel = supabase
      .channel('new_conversations')
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
            toast({
              title: "New Support Request",
              description: "A user is requesting technical support",
              variant: "default",
            });
          }
        }
      )
      .subscribe();
    
    // Listen for new messages
    const messagesChannel = supabase
      .channel('new_messages')
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
            toast({
              title: "New Support Message",
              description: "A user has sent a new message in support chat",
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
    };
  };

  // Check for active support conversations
  const checkExistingRequests = async () => {
    try {
      console.log('Checking for existing support conversations');
      const { data, error } = await supabase
        .from('conversations')
        .select('id')
        .eq('status', 'active');
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        console.log('Found existing support conversations:', data.length);
        setHasPendingSupport(true);
      }
    } catch (error) {
      console.error('Error checking for support conversations:', error);
    }
  };

  return { 
    subscribeToSupportRequests,
    checkExistingRequests
  };
}
