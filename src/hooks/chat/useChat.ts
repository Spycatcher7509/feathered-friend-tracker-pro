
import { useCallback } from "react"
import { useConversation } from "./useConversation"
import { useMessageSubscription } from "./useMessageSubscription"
import { useMessageSending } from "./useMessageSending"
import { useFormData } from "./useFormData"
import { ChatHookReturn } from "./types"

export const useChat = (): ChatHookReturn => {
  try {
    const {
      conversationId,
      showForm,
      isLoading: conversationLoading,
      initializeConversation,
      endConversation,
      isAdmin
    } = useConversation()

    const {
      messages,
      isLoading: messagesLoading,
      cleanup: cleanupMessageSubscription
    } = useMessageSubscription(conversationId)

    const {
      newMessage,
      setNewMessage,
      isSending,
      sendMessage
    } = useMessageSending(conversationId)

    const {
      formData,
      setFormData,
      handleFileUpload,
      handleStartChat,
      resetFormData
    } = useFormData(initializeConversation)

    const handleEndConversation = useCallback(async () => {
      try {
        const success = await endConversation()
        if (success) {
          cleanupMessageSubscription()
          resetFormData()
        }
        // Remove the return success to match void return type
      } catch (error) {
        console.error("Error ending conversation:", error);
      }
    }, [endConversation, cleanupMessageSubscription, resetFormData])

    return {
      messages,
      newMessage,
      setNewMessage,
      isLoading: conversationLoading || messagesLoading,
      isSending,
      showForm,
      formData,
      handleFileUpload,
      handleStartChat,
      sendMessage,
      endConversation: handleEndConversation,
      setFormData,
      isAdmin,
      initializeConversation
    }
  } catch (error) {
    console.error("Error in useChat hook:", error);
    // Return minimal implementation to prevent app from crashing
    return {
      messages: [],
      newMessage: "",
      setNewMessage: () => {},
      isLoading: false,
      isSending: false,
      showForm: true,
      formData: {
        fullName: "",
        email: "",
        description: "",
        attachments: []
      },
      handleFileUpload: () => {},
      handleStartChat: async () => {},
      sendMessage: async () => {},
      endConversation: async () => {}, // Modified to return void instead of boolean
      setFormData: () => {},
      isAdmin: false,
      initializeConversation: async () => {}
    };
  }
}
