
import { useState, useEffect, useCallback } from "react"
import { MessageCircle } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useUserEmail } from "@/hooks/useUserEmail"
import { supabase } from "@/integrations/supabase/client"
import { ChatForm } from "./ChatForm"
import { MessagesList } from "./MessagesList"
import { MessageInput } from "./MessageInput"

export const Chat = () => {
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [showForm, setShowForm] = useState(true)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    description: "",
    attachments: [] as File[]
  })
  
  const userEmail = useUserEmail()
  const { toast } = useToast()

  // Setup subscription to receive messages
  const setupMessageSubscription = useCallback((convId: string) => {
    console.log('Setting up message subscription for conversation:', convId)
    
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
      .subscribe()

    return () => {
      console.log('Cleaning up message subscription')
      supabase.removeChannel(channel)
    }
  }, [])

  useEffect(() => {
    if (conversationId) {
      const cleanupFn = setupMessageSubscription(conversationId)
      
      // Fetch existing messages
      const fetchMessages = async () => {
        try {
          console.log('Fetching existing messages for conversation:', conversationId)
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
        }
      }
      
      fetchMessages()
      
      return cleanupFn
    }
  }, [conversationId, setupMessageSubscription])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...Array.from(e.target.files || [])]
      }))
    }
  }

  const initializeConversation = async (metadata: typeof formData) => {
    setIsLoading(true)
    try {
      console.log('Initializing conversation with metadata:', metadata)
      const { data: { user } } = await supabase.auth.getUser()
      
      const userId = user?.id || 'anonymous'
      console.log('User ID for conversation:', userId)

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

  return (
    <Sheet>
      <SheetTrigger asChild>
        <div className="fixed bottom-4 right-4 flex items-center gap-2">
          <span className="bg-white px-3 py-1 rounded-full shadow text-sm">
            Technical Support
          </span>
          <Button
            className="rounded-full w-12 h-12 p-0"
            variant="default"
          >
            <MessageCircle className="h-6 w-6" />
          </Button>
        </div>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] p-0">
        <div className="flex flex-col h-full">
          <div className="p-4 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Support Chat</h2>
              {!showForm && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={endConversation}
                >
                  End Chat
                </Button>
              )}
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {showForm ? (
              <ChatForm
                formData={formData}
                isLoading={isLoading}
                onSubmit={handleStartChat}
                onFileUpload={handleFileUpload}
                onFormDataChange={(updates) => setFormData(prev => ({ ...prev, ...updates }))}
              />
            ) : (
              <MessagesList
                messages={messages}
                isLoading={isLoading}
              />
            )}
          </div>

          {!showForm && (
            <div className="p-4 border-t">
              <MessageInput
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onSend={sendMessage}
                disabled={isLoading || isSending}
              />
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
