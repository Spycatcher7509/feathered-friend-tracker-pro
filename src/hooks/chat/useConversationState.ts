
import { useState } from "react"
import { useUserEmail } from "@/hooks/useUserEmail"
import { useAdminStatus } from "@/hooks/useAdminStatus"

/**
 * Hook for managing conversation state
 */
export const useConversationState = () => {
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showForm, setShowForm] = useState(true)
  const userEmail = useUserEmail()
  const isAdmin = useAdminStatus()

  return {
    conversationId,
    setConversationId,
    isLoading,
    setIsLoading,
    showForm,
    setShowForm,
    userEmail,
    isAdmin: isAdmin.current
  }
}
