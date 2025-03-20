
import { useCallback } from "react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { ChatFormData } from "./types"
import {
  createConversation,
  storeConversationMetadata,
  uploadAttachments,
  updateConversationAttachments,
  sendSystemMessage,
  closeConversation,
  sendConversationSummary
} from "./conversationService"

/**
 * Hook containing actions for conversation management
 */
export const useConversationActions = (state: {
  conversationId: string | null,
  setConversationId: (id: string | null) => void,
  isLoading: boolean,
  setIsLoading: (loading: boolean) => void,
  showForm: boolean,
  setShowForm: (show: boolean) => void,
  userEmail: string | null,
  isAdmin: boolean
}) => {
  const { toast } = useToast()
  const {
    conversationId,
    setConversationId,
    isLoading,
    setIsLoading,
    setShowForm,
    userEmail,
    isAdmin
  } = state

  /**
   * Initializes a new conversation
   */
  const initializeConversation = useCallback(async (metadata?: ChatFormData) => {
    if (isLoading) return // Prevent multiple initializations
    
    setIsLoading(true)
    try {
      console.log('Initializing conversation with metadata:', metadata)
      console.log('Is admin when initializing:', isAdmin)
      
      // Get user information - handle error if not authenticated
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError) {
        console.error('Error getting user:', userError)
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "Please sign in to start a conversation."
        })
        setIsLoading(false)
        return
      }
      
      const userId = user?.id || 'anonymous'
      console.log('User ID for conversation:', userId)

      // Create new conversation
      const newConv = await createConversation(userId)

      if (newConv) {
        console.log('Created new conversation:', newConv.id)
        setConversationId(newConv.id)
        
        // For admin users, we don't need to store detailed metadata
        if (!isAdmin && metadata) {
          // Store metadata for the conversation
          await storeConversationMetadata(newConv.id, metadata)

          // Handle file attachments if any
          if (metadata.attachments && metadata.attachments.length > 0) {
            console.log('Uploading attachments:', metadata.attachments.length)
            try {
              const uploadedFiles = await uploadAttachments(newConv.id, metadata.attachments)
              // Update metadata with file paths
              await updateConversationAttachments(newConv.id, uploadedFiles)
            } catch (uploadError) {
              console.error('Error processing uploads:', uploadError)
              // Continue with the conversation even if uploads fail
            }
          }
        }

        // Customize welcome message based on user type
        const welcomeMessage = isAdmin 
          ? `You are now connected as an admin. You can respond to user inquiries.`
          : `Welcome ${metadata?.fullName || 'User'}! Our support team will respond as soon as possible.`

        // Send system welcome message
        try {
          await sendSystemMessage(newConv.id, welcomeMessage, userId)
        } catch (messageError) {
          console.error('Error sending welcome message:', messageError)
          // Continue even if welcome message fails
        }

        setShowForm(false)
        toast({
          title: "Chat Started",
          description: "Your support chat session has been initiated."
        })
      }
    } catch (error) {
      console.error('Error initializing conversation:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to start conversation. Please try again."
      })
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, isAdmin, setIsLoading, setConversationId, setShowForm, toast])

  /**
   * Ends an active conversation
   */
  const endConversation = useCallback(async () => {
    if (!conversationId) return false

    try {
      console.log('Ending conversation:', conversationId)
      // Update the conversation status to closed
      await closeConversation(conversationId)

      // Send email summary if user email is available
      if (userEmail) {
        console.log('Sending conversation summary to email:', userEmail)
        try {
          await sendConversationSummary(conversationId, userEmail)
          toast({
            title: "Conversation Ended",
            description: "A summary has been sent to your email"
          })
        } catch (emailError) {
          console.error('Error sending email summary:', emailError)
          toast({
            title: "Conversation Ended",
            description: "Thank you for contacting us"
          })
        }
      } else {
        toast({
          title: "Conversation Ended",
          description: "Thank you for contacting us"
        })
      }

      // Reset chat state
      setConversationId(null)
      setShowForm(true)
      
      return true
    } catch (error) {
      console.error('Error ending conversation:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to end conversation. Please try again."
      })
      return false
    }
  }, [conversationId, userEmail, setConversationId, setShowForm, toast])

  return {
    initializeConversation,
    endConversation
  }
}
