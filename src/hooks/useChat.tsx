
import { useState, useEffect, useCallback, useRef } from "react"
import { useToast } from "@/hooks/use-toast"
import { useUserEmail } from "@/hooks/useUserEmail"
import { supabase } from "@/integrations/supabase/client"

interface ChatFormData {
  fullName: string
  email: string
  description: string
  attachments: File[]
}

export const useChat = () => {
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [showForm, setShowForm] = useState(true)
  const [formData, setFormData] = useState<ChatFormData>({
    fullName: "",
    email: "",
    description: "",
    attachments: []
  })
  
  const userEmail = useUserEmail()
  const { toast } = useToast()
  const messageSubscription = useRef<any>(null)

  // Setup subscription to receive messages
  const setupMessageSubscription = useCallback((convId: string) => {
    console.log('Setting up message subscription for conversation:', convId)
    
    if (messageSubscription.current) {
      console.log('Removing existing message subscription')
      supabase.removeChannel(messageSubscription.current)
    }
    
    const channel = supabase
      .channel(`chat_${convId}`)
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
            setMessages(prev => [...prev, payload.new])
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
            setMessages(data)
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
    }
  }, [conversationId, setupMessageSubscription, toast])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...Array.from(e.target.files || [])]
      }))
    }
  }

  const initializeConversation = async (metadata: ChatFormData) => {
    setIsLoading(true)
    try {
      console.log('Initializing conversation with metadata:', metadata)
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

        // Send system welcome message
        await supabase
          .from('messages')
          .insert({
            content: `Welcome ${metadata.fullName}! Our support team will respond as soon as possible.`,
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

  const handleStartChat = async (e: React.FormEvent) => {
    e.preventDefault()
    // Validate form data
    if (!formData.fullName || !formData.email || !formData.description) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill out all required fields"
      })
      return
    }
    await initializeConversation(formData)
  }

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

  const endConversation = async () => {
    if (!conversationId) return

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
      if (messageSubscription.current) {
        supabase.removeChannel(messageSubscription.current)
        messageSubscription.current = null
      }
      
      setConversationId(null)
      setMessages([])
      setShowForm(true)
      setFormData({
        fullName: "",
        email: "",
        description: "",
        attachments: []
      })
    } catch (error) {
      console.error('Error ending conversation:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to end conversation. Please try again."
      })
    }
  }

  return {
    messages,
    newMessage,
    setNewMessage,
    isLoading,
    isSending,
    showForm,
    formData,
    handleFileUpload,
    handleStartChat,
    sendMessage,
    endConversation,
    setFormData
  }
}

export type ChatFormData = {
  fullName: string
  email: string
  description: string
  attachments: File[]
}
