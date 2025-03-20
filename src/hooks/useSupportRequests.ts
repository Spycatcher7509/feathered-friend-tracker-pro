
import { supabase } from "@/integrations/supabase/client";

export const useSupportRequests = () => {
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
        return true;
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
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error checking for support conversations:', error);
      return false;
    }
  };

  return { checkExistingRequests };
};
