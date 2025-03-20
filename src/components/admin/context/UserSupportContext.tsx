
import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useNotificationSound } from "@/hooks/useNotificationSound";
import { useAdminStatus } from "@/hooks/useAdminStatus";
import { useSupportRequests } from "@/hooks/useSupportRequests";
import { useSupportSubscriptions } from "@/hooks/useSupportSubscriptions";

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
  const navigate = useNavigate();
  const { playNotificationSound } = useNotificationSound();
  const isAdmin = useAdminStatus();
  const { checkExistingRequests: checkRequests } = useSupportRequests();

  const checkExistingRequests = async () => {
    const hasRequests = await checkRequests();
    setHasPendingSupport(hasRequests);
  };

  // Subscribe to real-time support notifications
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
