
import { useState, useEffect, useCallback, useRef } from "react"
import { supabase } from "@/integrations/supabase/client"
import { Message } from "./types"
import { useToast } from "@/hooks/use-toast"

export const useMessageSubscription = (conversationId: string | null) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const messageSubscription = useRef<any>(null)
  const { toast } = useToast()

  // Setup subscription to receive messages
  const setupMessageSubscription = useCallback((convId: string) => {
    console.log('Setting up message subscription for conversation:', convId)
    
    if (messageSubscription.current) {
      console.log('Removing existing message subscription')
      supabase.removeChannel(messageSubscription.current)
    }
    
    const channelName = `chat_messages_${convId}`
    console.log('Creating channel:', channelName)
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${convId}`
        },
        (payload) => {
          console.log('Received new message in subscription:', payload)
          if (payload.new) {
            setMessages(prev => {
              // Check if message already exists to prevent duplicates
              const exists = prev.some(msg => msg.id === (payload.new as Message).id)
              if (exists) {
                return prev
              }
              return [...prev, payload.new as Message]
            })
          }
        }
      )
      .subscribe((status) => {
        console.log(`Message subscription status for conversation ${convId}:`, status)
      })
      
    messageSubscription.current = channel

    return () => {
      console.log('Cleaning up message subscription')
      if (messageSubscription.current) {
        supabase.removeChannel(messageSubscription.current)
        messageSubscription.current = null
      }
    }
  }, [])

  // Fetch existing messages and setup subscription when conversationId changes
  useEffect(() => {
    if (conversationId) {
      const cleanupFn = setupMessageSubscription(conversationId)
      
      // Fetch existing messages
      const fetchMessages = async () => {
        try {
          console.log('Fetching existing messages for conversation:', conversationId)
          setIsLoading(true)
          const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true })
          
          if (error) throw error
          
          if (data) {
            console.log('Fetched messages:', data.length)
            setMessages(data as Message[])
          }
        } catch (error) {
          console.error('Error fetching messages:', error)
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load messages. Please try again."
          })
        } finally {
          setIsLoading(false)
        }
      }
      
      fetchMessages()
      
      return cleanupFn
    } else {
      // Reset messages when conversation is ended or not started
      setMessages([])
    }
  }, [conversationId, setupMessageSubscription, toast])

  const cleanup = useCallback(() => {
    if (messageSubscription.current) {
      supabase.removeChannel(messageSubscription.current)
      messageSubscription.current = null
    }
  }, [])

  return {
    messages,
    isLoading,
    cleanup
  }
}
