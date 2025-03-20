
import { supabase } from "@/integrations/supabase/client"
import { useCallback } from "react"
import { closeConversation, createConversation, sendSystemMessage, storeConversationMetadata, updateConversationAttachments, uploadAttachments } from "./conversationService"
import { ChatFormData } from "./types"

/**
 * Hook for conversation actions
 */
export const useConversationActions = (state: any) => {
  const initializeConversation = useCallback(async (metadata?: ChatFormData) => {
    try {
      state.setIsLoading(true)

      // If user is an admin, they don't need to provide metadata
      if (!state.isAdmin && !metadata) {
        console.error('Non-admin users must provide metadata')
        return
      }

      // Create conversation in database
      const userId = state.isAdmin ? 'admin' : state.userEmail
      console.log("Creating conversation with user ID:", userId)
      const newConv = await createConversation(userId)
      
      state.setConversationId(newConv.id)
      state.setShowForm(false)

      // If metadata is provided (for regular users), store it
      if (metadata) {
        // Store metadata
        await storeConversationMetadata(newConv.id, metadata)
        
        // Handle file uploads if present
        if (metadata.attachments && metadata.attachments.length > 0) {
          const fileUrls = await uploadAttachments(newConv.id, metadata.attachments)
          await updateConversationAttachments(newConv.id, fileUrls)
        }

        // Send welcome message
        await sendSystemMessage(
          newConv.id,
          `Chat started by ${metadata.fullName}. Topic: ${metadata.description}`,
          userId
        )
      } else {
        // Admin welcome message
        await sendSystemMessage(
          newConv.id,
          "Admin chat initialized. How can I help you today?",
          userId
        )
      }
    } catch (error) {
      console.error('Error initializing conversation:', error)
    } finally {
      state.setIsLoading(false)
    }
  }, [state])

  const endConversation = useCallback(async (): Promise<void> => {
    try {
      if (!state.conversationId) {
        console.error('No active conversation to end')
        return
      }

      state.setIsLoading(true)

      // Close the conversation in the database
      await closeConversation(state.conversationId)

      // Send summary if non-admin
      if (!state.isAdmin && state.userEmail) {
        await supabase.functions.invoke('send-conversation', {
          body: {
            conversationId: state.conversationId,
            userEmail: state.userEmail
          }
        })
      }

      // Reset states
      state.setConversationId(null)
      state.setShowForm(true)
    } catch (error) {
      console.error('Error ending conversation:', error)
    } finally {
      state.setIsLoading(false)
    }
  }, [state])

  return {
    initializeConversation,
    endConversation
  }
}
