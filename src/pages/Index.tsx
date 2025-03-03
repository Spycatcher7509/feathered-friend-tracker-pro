
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

const Index = () => {
  const [state, dispatch] = useReducer(dashboardReducer, initialState)
  const { checkAdminStatus } = useAdminGroups()
  const actions = useDashboardActions(dispatch)

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
