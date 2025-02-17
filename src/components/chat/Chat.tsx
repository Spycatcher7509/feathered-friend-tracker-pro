
import { useState, useEffect } from "react"
import { MessageCircle, Video, Mic, Paperclip, Send } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useUserEmail } from "@/hooks/useUserEmail"
import { supabase } from "@/integrations/supabase/client"

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

      // Create new conversation
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
        
        // Save metadata
        const { error: metadataError } = await supabase
          .from('chat_metadata')
          .insert({
            conversation_id: newConv.id,
            full_name: metadata.fullName,
            email: metadata.email,
            description: metadata.description,
            attachments: []  // We'll update this after file uploads
          })

        if (metadataError) throw metadataError

        // Upload attachments if any
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
          
          // Update metadata with file paths
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

      // Reset conversation state
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

  const startVideoCall = () => {
    window.location.href = `tel:+441992924940`
  }

  const startVoiceCall = () => {
    window.location.href = `tel:+441992924940`
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          className="fixed bottom-4 right-4 rounded-full w-12 h-12 p-0"
          variant="default"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
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
              <form onSubmit={handleStartChat} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Full Name or Nickname</label>
                  <Input
                    value={formData.fullName}
                    onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email Address</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Please describe your issue or question..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Attachments</label>
                  <Input
                    type="file"
                    onChange={handleFileUpload}
                    multiple
                    className="cursor-pointer"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={startVideoCall}
                    className="flex-1"
                  >
                    <Video className="w-4 h-4 mr-2" />
                    Video Call
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={startVoiceCall}
                    className="flex-1"
                  >
                    <Mic className="w-4 h-4 mr-2" />
                    Voice Call
                  </Button>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Starting chat..." : "Start Chat"}
                </Button>
              </form>
            ) : (
              isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-pulse text-muted-foreground">
                    Loading messages...
                  </div>
                </div>
              ) : (
                messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.is_system_message ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.is_system_message
                          ? 'bg-gray-100'
                          : 'bg-blue-500 text-white'
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))
              )
            )}
          </div>

          {!showForm && (
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type your message..."
                  disabled={isLoading || isSending}
                />
                <Button 
                  onClick={sendMessage}
                  disabled={isLoading || isSending}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
