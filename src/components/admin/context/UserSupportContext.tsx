
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { sendDiscordWebhookMessage } from "@/utils/discord";
import { useNavigate } from "react-router-dom";

type UserSupportContextType = {
  hasPendingSupport: boolean;
  setHasPendingSupport: (value: boolean) => void;
  checkExistingRequests: () => Promise<void>;
};

const UserSupportContext = createContext<UserSupportContextType | undefined>(undefined);

export const useUserSupport = () => {
  const context = useContext(UserSupportContext);
  if (!context) {
    throw new Error("useUserSupport must be used within a UserSupportProvider");
  }
  return context;
};

export const UserSupportProvider = ({ children }: { children: React.ReactNode }) => {
  const [hasPendingSupport, setHasPendingSupport] = useState(false);
  const { toast } = useToast();
  const notificationSound = useRef<HTMLAudioElement | null>(null);
  const navigate = useNavigate();
  const isAdmin = useRef(false);

  // Initialize notification sound
  useEffect(() => {
    notificationSound.current = new Audio('/notification.mp3');
    
    // Check if user is admin
    const checkAdminStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .single();
          
          isAdmin.current = data?.is_admin || false;
          console.log('User admin status:', isAdmin.current);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
      }
    };
    
    checkAdminStatus();
    
    return () => {
      if (notificationSound.current) {
        notificationSound.current.pause();
        notificationSound.current.src = "";
      }
    };
  }, []);

  // Play notification sound
  const playNotificationSound = () => {
    if (notificationSound.current) {
      notificationSound.current.currentTime = 0;
      notificationSound.current.play()
        .catch(err => console.error("Error playing notification sound:", err));
    }
  };

  // Check for active support conversations
  const checkExistingRequests = async () => {
    try {
      console.log('Checking for existing support conversations');
      const { data, error } = await supabase
        .from('conversations')
        .select('id')
        .eq('status', 'active');
      
      if (error) {
        console.error('Error checking for support conversations:', error);
        throw error;
      }
      
      console.log('Active conversations found:', data?.length || 0);
      if (data && data.length > 0) {
        console.log('Found existing support conversations:', data.length);
        setHasPendingSupport(true);
      } else {
        // Check for unresolved issues
        const { data: issues, error: issuesError } = await supabase
          .from('issues')
          .select('id')
          .eq('status', 'open');
          
        if (issuesError) {
          console.error('Error checking for open issues:', issuesError);
        } else if (issues && issues.length > 0) {
          console.log('Found open issues:', issues.length);
          setHasPendingSupport(true);
        }
      }
    } catch (error) {
      console.error('Error checking for support conversations:', error);
    }
  };

  // Subscribe to real-time support notifications
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

    // Check for existing requests on initial load
    checkExistingRequests();

    return () => {
      console.log('Cleaning up support request subscriptions');
      supabase.removeChannel(conversationsChannel);
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(issuesChannel);
    };
  }, [toast]);

  return (
    <UserSupportContext.Provider value={{ 
      hasPendingSupport, 
      setHasPendingSupport,
      checkExistingRequests
    }}>
      {children}
    </UserSupportContext.Provider>
  );
};
