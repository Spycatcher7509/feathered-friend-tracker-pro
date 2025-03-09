
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
      const { data: { user } } = await supabase.auth.getUser()
      const userId = user?.id || 'anonymous'

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
