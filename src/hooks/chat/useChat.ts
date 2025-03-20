
import { useCallback } from "react"
import { useConversation } from "./useConversation"
import { useMessageSubscription } from "./useMessageSubscription"
import { useMessageSending } from "./useMessageSending"
import { useFormData } from "./useFormData"
import { ChatHookReturn } from "./types"

export const useChat = (): ChatHookReturn => {
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
    const success = await endConversation()
    if (success) {
      cleanupMessageSubscription()
      resetFormData()
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
}
