
import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useNotificationSound } from "@/hooks/useNotificationSound";
import { useAdminStatus } from "@/hooks/useAdminStatus";
import { useSupportRequests } from "@/hooks/useSupportRequests";
import { useSupportSubscriptions } from "@/hooks/useSupportSubscriptions";

/**
 * Context type definition for the UserSupportContext
 */
type UserSupportContextType = {
  hasPendingSupport: boolean;
  setHasPendingSupport: (value: boolean) => void;
  checkExistingRequests: () => Promise<void>;
};

/**
 * Context for managing user support requests and notifications
 * 
 * This context serves as the central coordinator for the support system,
 * bringing together all the specialized hooks:
 * - useNotificationSound: Handles playing sound alerts
 * - useAdminStatus: Checks if the current user is an admin
 * - useSupportRequests: Provides functions to check for existing support requests
 * - useSupportSubscriptions: Sets up real-time subscriptions for new support items
 */
const UserSupportContext = createContext<UserSupportContextType | undefined>(undefined);

/**
 * Hook to access the UserSupportContext
 * Ensures the hook is used within a UserSupportProvider
 */
export const useUserSupport = () => {
  const context = useContext(UserSupportContext);
  if (!context) {
    throw new Error("useUserSupport must be used within a UserSupportProvider");
  }
  return context;
};

/**
 * Provider component for the UserSupportContext
 * 
 * This provider:
 * 1. Manages the state of pending support requests
 * 2. Initializes all required hooks for the support system
 * 3. Checks for existing support requests on initial load
 * 4. Sets up real-time subscriptions for new support items
 * 
 * @param {Object} props - Provider props
 * @param {React.ReactNode} props.children - Child components
 */
export const UserSupportProvider = ({ children }: { children: React.ReactNode }) => {
  // State to track if there are pending support requests
  const [hasPendingSupport, setHasPendingSupport] = useState(false);
  
  // Navigation for redirecting to support pages
  const navigate = useNavigate();
  
  // Initialize hooks for the support system
  const { playNotificationSound } = useNotificationSound();
  const isAdmin = useAdminStatus();
  const { checkExistingRequests: checkRequests } = useSupportRequests();

  /**
   * Function to check for existing support requests and update state
   */
  const checkExistingRequests = async () => {
    const hasRequests = await checkRequests();
    setHasPendingSupport(hasRequests);
  };

  // Set up real-time subscriptions for support notifications
  useSupportSubscriptions({
    isAdmin,
    setHasPendingSupport,
    playNotificationSound
  });

  // Check for existing requests on initial load
  useEffect(() => {
    checkExistingRequests();
  }, []);

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
