
import { useEffect, useReducer } from "react"
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
import { ChevronDown, ChevronUp, FileCode, Users } from "lucide-react"
import { useAdminGroups } from "@/hooks/useAdminGroups"
import { BirdSpeciesManager } from "@/components/birds/BirdSpeciesManager"
import { BirdIdentifier } from "@/components/birds/BirdIdentifier"
import { GuideViewer } from "@/components/guides/GuideViewer"
import { DisclaimerDialog } from "@/components/auth/DisclaimerDialog"
import GoogleDriveBackup from "@/components/backup/GoogleDriveBackup"
import { Chat } from "@/components/chat/Chat"
import { UsersList } from "@/components/admin/UsersList"
import { format } from "date-fns"

// Define initial state for reducer
const initialState = {
  showBirdSounds: false,
  showTrends: false,
  showUserGuide: false,
  showAdminGuide: false,
  showUsers: false,
  isAdmin: false,
  currentTime: new Date(),
}

// Reducer function to manage state changes
const dashboardReducer = (state, action) => {
  switch (action.type) {
    case 'TOGGLE_BIRD_SOUNDS':
      return { ...state, showBirdSounds: !state.showBirdSounds }
    case 'TOGGLE_TRENDS':
      return { ...state, showTrends: !state.showTrends }
    case 'TOGGLE_USER_GUIDE':
      return { ...state, showUserGuide: !state.showUserGuide }
    case 'TOGGLE_ADMIN_GUIDE':
      return { ...state, showAdminGuide: !state.showAdminGuide }
    case 'TOGGLE_USERS':
      return { ...state, showUsers: !state.showUsers }
    case 'SET_ADMIN_STATUS':
      return { ...state, isAdmin: action.payload }
    case 'SET_TIME':
      return { ...state, currentTime: action.payload }
    default:
      return state
  }
}

const Index = () => {
  const [state, dispatch] = useReducer(dashboardReducer, initialState)
  const { checkAdminStatus } = useAdminGroups()

  // Check for admin status
  useEffect(() => {
    const checkAdmin = async () => {
      const adminStatus = await checkAdminStatus()
      dispatch({ type: 'SET_ADMIN_STATUS', payload: adminStatus })
    }
    checkAdmin()
  }, [checkAdminStatus])

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      dispatch({ type: 'SET_TIME', payload: new Date() })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <PageLayout header={<Navigation />}>
      <div className="container mx-auto px-4 py-8 space-y-12">
        <div className="text-center mb-4 text-xl font-semibold text-nature-800">
          {format(state.currentTime, 'EEEE, MMMM do yyyy, h:mm:ss a')}
        </div>

        <div className="space-y-6">
          <div>
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-nature-800">Bird Watching Dashboard</h1>
              <div className="mt-4 flex flex-wrap gap-4">
                <Button
                  variant="outline"
                  className="bg-[#223534] text-white hover:bg-[#2a4241]"
                  onClick={() => dispatch({ type: 'TOGGLE_USER_GUIDE' })}
                >
                  <FileCode className="mr-2" />
                  User Guide (HTML)
                </Button>
                {state.isAdmin && (
                  <>
                    <Button
                      variant="outline"
                      className="bg-[#223534] text-white hover:bg-[#2a4241]"
                      onClick={() => dispatch({ type: 'TOGGLE_ADMIN_GUIDE' })}
                    >
                      <FileCode className="mr-2" />
                      Admin Guide
                    </Button>
                    <Button
                      variant="outline"
                      className="bg-[#223534] text-white hover:bg-[#2a4241]"
                      onClick={() => dispatch({ type: 'TOGGLE_USERS' })}
                    >
                      <Users className="mr-2" />
                      View Users
                    </Button>
                  </>
                )}
              </div>
              {state.showUserGuide && (
                <div className="mt-4">
                  <GuideViewer type="user" />
                </div>
              )}
              {state.showAdminGuide && state.isAdmin && (
                <div className="mt-4">
                  <GuideViewer type="admin" />
                </div>
              )}
              {state.showUsers && state.isAdmin && (
                <div className="mt-4">
                  <UsersList />
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
                <div className="bg-white rounded-lg shadow p-6">
                  <GoogleDriveBackup />
                </div>
              </div>
            </div>
          </div>

          {state.isAdmin && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <ApiUsageMonitor />
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow p-6">
            <BirdSightingsList />
          </div>
        </div>

        <div className="space-y-4">
          <Button
            variant="outline"
            onClick={() => dispatch({ type: 'TOGGLE_TRENDS' })}
            className="w-full flex justify-between items-center py-6"
          >
            <span className="text-xl font-semibold">View Bird Population Trends</span>
            {state.showTrends ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
          </Button>

          {state.showTrends && (
            <div className="bg-white rounded-lg shadow p-6">
              <BirdTrends isAdmin={state.isAdmin} />
            </div>
          )}

          <Button
            variant="outline"
            onClick={() => dispatch({ type: 'TOGGLE_BIRD_SOUNDS' })}
            className="w-full flex justify-between items-center py-6"
          >
            <span className="text-xl font-semibold">Listen to Bird Sounds</span>
            {state.showBirdSounds ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
          </Button>

          {state.showBirdSounds && <ExternalBirdSounds />}
        </div>
      </div>

      <Chat />
      <DisclaimerDialog />
    </PageLayout>
  )
}

export default Index
