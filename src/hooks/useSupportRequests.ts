
import { supabase } from "@/integrations/supabase/client";

/**
 * Custom hook to check for existing support requests
 * 
 * This hook:
 * 1. Provides a function to check for active conversations and open issues
 * 2. Returns true if there are pending support matters that require attention
 * 3. Logs detailed information about found requests for debugging
 * 
 * @returns {Object} Object containing the checkExistingRequests function
 */
export const useSupportRequests = () => {
  /**
   * Checks for existing active support conversations or open issues
   * 
   * @returns {Promise<boolean>} Promise resolving to true if there are existing requests, false otherwise
   */
  const checkExistingRequests = async () => {
    try {
      console.log('Checking for existing support conversations');
      
      // First, check for active conversations
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
        // If no active conversations, check for unresolved issues
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
