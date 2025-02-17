
import { useState, useEffect } from "react"
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

  useEffect(() => {
    if (conversationId) {
      const channel = supabase
        .channel('chat')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `conversation_id=eq.${conversationId}`
          },
          (payload) => {
            if (payload.new && payload.new.is_system_message) {
              setMessages(prev => [...prev, payload.new])
            }
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [conversationId])

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
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: newConv, error: convError } = await supabase
        .from('conversations')
        .insert({
          user_id: user.id,
          status: 'active'
        })
        .select()
        .single()

      if (convError) throw convError

      if (newConv) {
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

        setShowForm(false)
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to start conversation"
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
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    try {
      const { data: message, error } = await supabase
        .from('messages')
        .insert({
          user_id: user.id,
          content: newMessage,
          conversation_id: conversationId,
          is_system_message: false
        })
        .select()
        .single()

      if (error) throw error

      if (message) {
        setMessages(prev => [...prev, message])
        setNewMessage("")
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send message"
      })
    } finally {
      setIsSending(false)
    }
  }

  const endConversation = async () => {
    if (!conversationId || !userEmail) return

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
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to end conversation"
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
