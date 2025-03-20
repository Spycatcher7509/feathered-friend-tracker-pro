
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
    if (isLoading) return; // Prevent multiple initializations
    
    setIsLoading(true)
    try {
      console.log('Initializing conversation with metadata:', metadata)
      console.log('Is admin when initializing:', isAdmin.current)
      
      // Get user information - handle error if not authenticated
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError) {
        console.error('Error getting user:', userError);
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "Please sign in to start a conversation."
        });
        setIsLoading(false);
        return;
      }
      
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

      if (convError) {
        console.error('Error creating conversation:', convError);
        throw convError;
      }

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

          if (metadataError) {
            console.error('Error storing metadata:', metadataError);
            throw metadataError;
          }

          // Handle file attachments if any
          if (metadata.attachments && metadata.attachments.length > 0) {
            console.log('Uploading attachments:', metadata.attachments.length)
            const uploadPromises = metadata.attachments.map(async (file) => {
              const filename = `${newConv.id}/${file.name}`
              const { error: uploadError } = await supabase.storage
                .from('chat-attachments')
                .upload(filename, file)
              
              if (uploadError) {
                console.error('Error uploading file:', uploadError);
                throw uploadError;
              }
              return filename
            })

            try {
              const uploadedFiles = await Promise.all(uploadPromises)
              
              // Update metadata with file paths
              await supabase
                .from('chat_metadata')
                .update({ attachments: uploadedFiles })
                .eq('conversation_id', newConv.id)
            } catch (uploadError) {
              console.error('Error processing uploads:', uploadError);
              // Continue with the conversation even if uploads fail
            }
          }
        }

        // Customize welcome message based on user type
        const welcomeMessage = isAdmin.current 
          ? `You are now connected as an admin. You can respond to user inquiries.`
          : `Welcome ${metadata?.fullName || 'User'}! Our support team will respond as soon as possible.`;

        // Send system welcome message
        try {
          await supabase
            .from('messages')
            .insert({
              content: welcomeMessage,
              conversation_id: newConv.id,
              is_system_message: true,
              user_id: userId
            })
        } catch (messageError) {
          console.error('Error sending welcome message:', messageError);
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
        try {
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
        } catch (emailError) {
          console.error('Error sending email summary:', emailError);
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
