
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Profile } from "../types";
import { formatProfileTimestamps } from "../utils/dateUtils";
import { useUserOperations } from "./useUserOperations";
import { useUserSupport } from "../context/UserSupportContext";

export function useUsers() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { checkExistingRequests } = useUserSupport();
  
  // Import user operations
  const { toggleAdminStatus, deleteUser } = useUserOperations(
    () => fetchUsers()
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
      checkExistingRequests();
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

  return { 
    users, 
    loading, 
    fetchUsers, 
    toggleAdminStatus, 
    deleteUser
  };
}
