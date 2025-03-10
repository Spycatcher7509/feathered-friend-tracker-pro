
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Profile } from "../types";
import { formatProfileTimestamps } from "../utils/dateUtils";
import { useUserOperations } from "./useUserOperations";
import { useSupportNotifications } from "./useSupportNotifications";

export function useUsers() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasPendingSupport, setHasPendingSupport] = useState(false);
  const { toast } = useToast();
  
  // Import user operations
  const { toggleAdminStatus, deleteUser } = useUserOperations(
    () => fetchUsers()
  );
  
  // Import support notifications
  const { subscribeToSupportRequests, checkExistingRequests } = useSupportNotifications(
    setHasPendingSupport
  );

  const fetchUsers = async (search?: string) => {
    try {
      console.log('Fetching users with search:', search);
      setLoading(true);
      
      let query = supabase
        .from('profiles')
        .select('*');
      
      if (search) {
        query = query.or(`email.ilike.%${search}%,username.ilike.%${search}%,location.ilike.%${search}%`);
      }
      
      const { data: profiles, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      // Format timestamps and set users
      const formattedProfiles = formatProfileTimestamps(profiles || []);
      setUsers(formattedProfiles);
      
      // Check for active support conversations
      const { data: conversations, error: convError } = await supabase
        .from('conversations')
        .select('status')
        .eq('status', 'active');
      
      if (!convError && conversations && conversations.length > 0) {
        console.log('Found active support conversations:', conversations.length);
        setHasPendingSupport(true);
      } else {
        console.log('No active support conversations found');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Run once on component mount to check for existing support requests
  useEffect(() => {
    checkExistingRequests();
  }, []);

  return { 
    users, 
    loading, 
    hasPendingSupport, 
    setHasPendingSupport,
    fetchUsers, 
    toggleAdminStatus, 
    deleteUser, 
    subscribeToSupportRequests 
  };
}
