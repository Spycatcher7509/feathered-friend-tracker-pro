
import { useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

export const useMessageSending = (conversationId: string | null) => {
  const [newMessage, setNewMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const { toast } = useToast()

  const sendMessage = async () => {
    if (!newMessage.trim() || !conversationId || isSending) return

    setIsSending(true)
    try {
      console.log('Sending message to conversation:', conversationId)
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      
      // Check if user is admin
      let isAdmin = false
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single()
        
        isAdmin = data?.is_admin || false
      }
      
      // Use special user_id for admin messages so they can be styled differently
      const userId = isAdmin ? 'admin' : (user?.id || 'anonymous')
      
      console.log('Sending message as user:', userId, isAdmin ? '(admin)' : '')

      const { data: message, error } = await supabase
        .from('messages')
        .insert({
          user_id: userId,
          content: newMessage,
          conversation_id: conversationId,
          is_system_message: false
        })
        .select()
        .single()

      if (error) throw error

      if (message) {
        console.log('Message sent successfully:', message.id)
        setNewMessage("")
      }
    } catch (error) {
      console.error('Error sending message:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send message. Please try again."
      })
    } finally {
      setIsSending(false)
    }
  }

  return {
    newMessage,
    setNewMessage,
    isSending,
    sendMessage
  }
}
