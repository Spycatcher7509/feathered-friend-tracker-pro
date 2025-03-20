
import { useEffect } from "react"
import { useConversationState } from "./useConversationState"
import { useConversationActions } from "./useConversationActions"

/**
 * Main hook for conversation functionality
 * This hook combines state and actions from smaller hooks
 */
export const useConversation = () => {
  const state = useConversationState()
  const actions = useConversationActions(state)

  // Effect to check for admin status on component mount
  useEffect(() => {
    console.log("Admin status in useConversation:", state.isAdmin)
  }, [state.isAdmin])

  return {
    conversationId: state.conversationId,
    showForm: state.showForm,
    isLoading: state.isLoading,
    initializeConversation: actions.initializeConversation,
    endConversation: actions.endConversation,
    setShowForm: state.setShowForm,
    isAdmin: state.isAdmin
  }
}
