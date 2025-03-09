
import { useEffect, useReducer } from "react"
import Navigation from "@/components/Navigation"
import PageLayout from "@/components/layout/PageLayout"
import { useAdminGroups } from "@/hooks/useAdminGroups"
import { Chat } from "@/components/chat/Chat"
import { DisclaimerDialog } from "@/components/auth/DisclaimerDialog"
import { dashboardReducer, initialState, useDashboardActions } from "@/features/dashboard/dashboardReducer"
import DashboardHeader from "@/features/dashboard/DashboardHeader"
import DashboardTools from "@/features/dashboard/DashboardTools"
import CollapsibleSections from "@/features/dashboard/CollapsibleSections"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

const Index = () => {
  const [state, dispatch] = useReducer(dashboardReducer, initialState)
  const { checkAdminStatus } = useAdminGroups()
  const actions = useDashboardActions(dispatch)
  const { toast } = useToast()

  // Check for admin status
  useEffect(() => {
    const checkAdmin = async () => {
      const adminStatus = await checkAdminStatus()
      actions.setAdminStatus(adminStatus)
    }
    checkAdmin()
  }, [checkAdminStatus])

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      actions.setTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Subscribe to chat notifications for admin users
  useEffect(() => {
    if (state.isAdmin) {
      console.log('Setting up support chat notifications for admin')
      
      // Listen for new conversations
      const conversationsChannel = supabase
        .channel('home_new_conversations')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'conversations'
          },
          (payload) => {
            console.log('Index page: New conversation detected:', payload)
            if (payload.new) {
              toast({
                title: "New Support Request",
                description: "A user is requesting technical support",
                variant: "default",
              })
            }
          }
        )
        .subscribe()
      
      // Listen for new messages
      const messagesChannel = supabase
        .channel('home_new_messages')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages'
          },
          (payload) => {
            console.log('Index page: New message detected:', payload)
            if (payload.new && !payload.new.is_system_message) {
              toast({
                title: "New Support Message",
                description: "A user has sent a new message in support chat",
                variant: "default",
              })
            }
          }
        )
        .subscribe()

      return () => {
        console.log('Cleaning up support chat subscriptions')
        supabase.removeChannel(conversationsChannel)
        supabase.removeChannel(messagesChannel)
      }
    }
  }, [state.isAdmin, toast])

  return (
    <PageLayout header={<Navigation />}>
      <div className="container mx-auto px-4 py-8 space-y-12">
        <DashboardHeader 
          state={state}
          onToggleUserGuide={actions.toggleUserGuide}
          onToggleAdminGuide={actions.toggleAdminGuide}
          onToggleUsers={actions.toggleUsers}
        />

        <DashboardTools isAdmin={state.isAdmin} />

        <CollapsibleSections
          state={state}
          onToggleTrends={actions.toggleTrends}
          onToggleBirdSounds={actions.toggleBirdSounds}
        />
      </div>

      <Chat />
      <DisclaimerDialog />
    </PageLayout>
  )
}

export default Index
