import { useState, useEffect } from "react"
import Navigation from "@/components/Navigation"
import PageLayout from "@/components/layout/PageLayout"
import ProfileImporter from "@/components/auth/ProfileImporter"
import ExternalBirdSounds from "@/components/birds/ExternalBirdSounds"
import AddBirdSighting from "@/components/birds/AddBirdSighting"
import BirdSightingsList from "@/components/birds/BirdSightingsList"
import BirdSpeciesImporter from "@/components/birds/BirdSpeciesImporter"
import ApiUsageMonitor from "@/components/admin/ApiUsageMonitor"
import BirdTrends from "@/components/birds/BirdTrends"
import SupportButtons from "@/components/auth/SupportButtons"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, FileCode, MessageCircle } from "lucide-react"
import { useAdminGroups } from "@/hooks/useAdminGroups"
import { BirdSpeciesManager } from "@/components/birds/BirdSpeciesManager"
import { BirdIdentifier } from "@/components/birds/BirdIdentifier"
import { GuideViewer } from "@/components/guides/GuideViewer"
import { DisclaimerDialog } from "@/components/auth/DisclaimerDialog"
import GoogleDriveBackup from "@/components/backup/GoogleDriveBackup"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useUserEmail } from "@/hooks/useUserEmail"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

const Index = () => {
  const [showBirdSounds, setShowBirdSounds] = useState(false)
  const [showTrends, setShowTrends] = useState(false)
  const [showUserGuide, setShowUserGuide] = useState(false)
  const [showAdminGuide, setShowAdminGuide] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [conversationId, setConversationId] = useState<string | null>(null)
  const { checkAdminStatus } = useAdminGroups()
  const userEmail = useUserEmail()
  const { toast } = useToast()

  useEffect(() => {
    const checkAdmin = async () => {
      const adminStatus = await checkAdminStatus()
      setIsAdmin(adminStatus)
    }
    checkAdmin()
  }, [])

  useEffect(() => {
    const initializeConversation = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Check for active conversation
      const { data: activeConv } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single()

      if (activeConv) {
        setConversationId(activeConv.id)
        // Load messages for active conversation
        const { data: msgs } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', activeConv.id)
          .order('created_at', { ascending: true })
        
        if (msgs) setMessages(msgs)
      } else {
        // Create new conversation
        const { data: newConv } = await supabase
          .from('conversations')
          .insert({
            user_id: user.id,
            status: 'active'
          })
          .select()
          .single()

        if (newConv) setConversationId(newConv.id)
      }
    }

    initializeConversation()
  }, [])

  const sendMessage = async () => {
    if (!newMessage.trim() || !conversationId) return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

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

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send message"
      })
      return
    }

    if (message) {
      setMessages(prev => [...prev, message])
      setNewMessage("")
    }
  }

  const endConversation = async () => {
    if (!conversationId || !userEmail) return

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-conversation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          conversationId,
          userEmail
        })
      })

      if (!response.ok) throw new Error('Failed to send conversation')

      toast({
        title: "Conversation Ended",
        description: "A summary has been sent to your email"
      })

      // Reset conversation state
      setConversationId(null)
      setMessages([])

      // Create new conversation
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: newConv } = await supabase
          .from('conversations')
          .insert({
            user_id: user.id,
            status: 'active'
          })
          .select()
          .single()

        if (newConv) setConversationId(newConv.id)
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to end conversation"
      })
    }
  }

  return (
    <PageLayout header={<Navigation />}>
      <div className="container mx-auto px-4 py-8 space-y-12">
        <div className="space-y-6">
          <div>
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-nature-800">Bird Watching Dashboard</h1>
              <div className="mt-4 flex flex-wrap gap-4">
                <Button
                  variant="outline"
                  className="bg-[#223534] text-white hover:bg-[#2a4241]"
                  onClick={() => setShowUserGuide(!showUserGuide)}
                >
                  <FileCode className="mr-2" />
                  User Guide
                </Button>
                {isAdmin && (
                  <Button
                    variant="outline"
                    className="bg-[#223534] text-white hover:bg-[#2a4241]"
                    onClick={() => setShowAdminGuide(!showAdminGuide)}
                  >
                    <FileCode className="mr-2" />
                    Admin Guide
                  </Button>
                )}
              </div>
              {showUserGuide && (
                <div className="mt-4">
                  <GuideViewer type="user" />
                </div>
              )}
              {showAdminGuide && isAdmin && (
                <div className="mt-4">
                  <GuideViewer type="admin" />
                </div>
              )}
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <AddBirdSighting />
              <div className="space-y-6">
                <div className="flex flex-wrap gap-4 items-center">
                  <BirdSpeciesManager />
                  <BirdIdentifier />
                  <BirdSpeciesImporter />
                  <ProfileImporter />
                  <SupportButtons />
                </div>
              </div>
            </div>
          </div>

          {isAdmin && (
            <>
              <div className="bg-white rounded-lg shadow p-6">
                <ApiUsageMonitor />
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <GoogleDriveBackup />
              </div>
            </>
          )}

          <BirdSightingsList />
        </div>

        <div className="space-y-4">
          <Button
            variant="outline"
            onClick={() => setShowTrends(!showTrends)}
            className="w-full flex justify-between items-center py-6"
          >
            <span className="text-xl font-semibold">View Bird Population Trends</span>
            {showTrends ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
          </Button>
          
          {showTrends && (
            <div className="bg-white rounded-lg shadow p-6">
              <BirdTrends isAdmin={isAdmin} />
            </div>
          )}

          <Button
            variant="outline"
            onClick={() => setShowBirdSounds(!showBirdSounds)}
            className="w-full flex justify-between items-center py-6"
          >
            <span className="text-xl font-semibold">Listen to Bird Sounds</span>
            {showBirdSounds ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
          </Button>
          
          {showBirdSounds && <ExternalBirdSounds />}
        </div>
      </div>
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
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={endConversation}
                >
                  End Chat
                </Button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => (
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
              ))}
            </div>

            <div className="p-4 border-t">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                />
                <Button onClick={sendMessage}>Send</Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
      <DisclaimerDialog />
    </PageLayout>
  )
}

export default Index
