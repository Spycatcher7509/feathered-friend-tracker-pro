
import { useState, useCallback, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { ChatFormData } from "./types"
import { useUserEmail } from "@/hooks/useUserEmail"
import { useAdminStatus } from "@/hooks/useAdminStatus"

export const useConversation = () => {
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showForm, setShowForm] = useState(true)
  const { toast } = useToast()
  const userEmail = useUserEmail()
  const isAdmin = useAdminStatus()

  // Effect to check for admin status on component mount
  useEffect(() => {
    console.log("Admin status in useConversation:", isAdmin.current);
  }, [isAdmin]);

  const initializeConversation = async (metadata?: ChatFormData) => {
    setIsLoading(true)
    try {
      console.log('Initializing conversation with metadata:', metadata)
      console.log('Is admin when initializing:', isAdmin.current)
      
      // Get user information
      const { data: { user } } = await supabase.auth.getUser()
      
      const userId = user?.id || 'anonymous'
      console.log('User ID for conversation:', userId)

      // Create new conversation
      const { data: newConv, error: convError } = await supabase
        .from('conversations')
        .insert({
          user_id: userId,
          status: 'active'
        })
        .select()
        .single()

      if (convError) throw convError

      if (newConv) {
        console.log('Created new conversation:', newConv.id)
        setConversationId(newConv.id)
        
        // For admin users, we don't need to store detailed metadata
        if (!isAdmin.current && metadata) {
          // Store metadata for the conversation
          const { error: metadataError } = await supabase
            .from('chat_metadata')
            .insert({
              conversation_id: newConv.id,
              full_name: metadata.fullName,
              email: metadata.email,
              description: metadata.description,
              attachments: []
            })

          if (metadataError) throw metadataError

          // Handle file attachments if any
          if (metadata.attachments.length > 0) {
            console.log('Uploading attachments:', metadata.attachments.length)
            const uploadPromises = metadata.attachments.map(async (file) => {
              const filename = `${newConv.id}/${file.name}`
              const { error: uploadError } = await supabase.storage
                .from('chat-attachments')
                .upload(filename, file)
              
              if (uploadError) throw uploadError
              return filename
            })

            const uploadedFiles = await Promise.all(uploadPromises)
            
            // Update metadata with file paths
            await supabase
              .from('chat_metadata')
              .update({ attachments: uploadedFiles })
              .eq('conversation_id', newConv.id)
          }
        }

        // Customize welcome message based on user type
        const welcomeMessage = isAdmin.current 
          ? `You are now connected as an admin. You can respond to user inquiries.`
          : `Welcome ${metadata?.fullName || 'User'}! Our support team will respond as soon as possible.`;

        // Send system welcome message
        await supabase
          .from('messages')
          .insert({
            content: welcomeMessage,
            conversation_id: newConv.id,
            is_system_message: true,
            user_id: userId
          })

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
  }

  const endConversation = async () => {
    if (!conversationId) return false

    try {
      console.log('Ending conversation:', conversationId)
      // First update the conversation status
      const { error: statusError } = await supabase
        .from('conversations')
        .update({ status: 'closed' })
        .eq('id', conversationId)
      
      if (statusError) throw statusError

      if (userEmail) {
        console.log('Sending conversation summary to email:', userEmail)
        const { error } = await supabase.functions.invoke('send-conversation', {
          body: {
            conversationId,
            userEmail
          }
        })

        if (error) throw error

        toast({
          title: "Conversation Ended",
          description: "A summary has been sent to your email"
        })
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
  }

  return {
    conversationId,
    showForm,
    isLoading,
    initializeConversation,
    endConversation,
    setShowForm,
    isAdmin: isAdmin.current
  }
}
