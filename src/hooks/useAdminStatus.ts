
import { useEffect, useRef } from 'react';
import { supabase } from "@/integrations/supabase/client";

export const useAdminStatus = () => {
  const isAdmin = useRef(false);

  useEffect(() => {
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
  }, []);

  return isAdmin;
};
