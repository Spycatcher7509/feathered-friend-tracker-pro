
import { useEffect, useRef } from 'react';
import { supabase } from "@/integrations/supabase/client";

/**
 * Custom hook to check if the current user has admin privileges
 * 
 * This hook:
 * 1. Makes a database query on mount to check if the current user has admin status
 * 2. Returns a ref containing the admin status that can be used across components
 * 3. Logs the admin status for debugging purposes
 * 
 * @returns {RefObject<boolean>} A reference to the user's admin status
 */
export const useAdminStatus = () => {
  // Using a ref to persist the admin status without causing re-renders
  const isAdmin = useRef(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        // Get the current user from Supabase auth
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Check if the user has admin privileges in the profiles table
          const { data } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .single();
          
          // Update the ref with the admin status
          isAdmin.current = data?.is_admin || false;
          console.log('User admin status:', isAdmin.current);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
      }
    };
    
    // Check admin status when the hook is first used
    checkAdminStatus();
  }, []);

  return isAdmin;
};
