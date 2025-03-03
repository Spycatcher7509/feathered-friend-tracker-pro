
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { FileCode, Users } from "lucide-react"
import { GuideViewer } from "@/components/guides/GuideViewer"
import { UsersList } from "@/components/admin/UsersList"
import { DashboardState } from "./dashboardReducer"

interface DashboardHeaderProps {
  state: DashboardState;
  onToggleUserGuide: () => void;
  onToggleAdminGuide: () => void;
  onToggleUsers: () => void;
}

const DashboardHeader = ({ 
  state, 
  onToggleUserGuide, 
  onToggleAdminGuide, 
  onToggleUsers 
}: DashboardHeaderProps) => {
  return (
    <div className="mb-6">
      <div className="text-center mb-4 text-xl font-semibold text-nature-800">
        {format(state.currentTime, 'EEEE, MMMM do yyyy, h:mm:ss a')}
      </div>
      
      <h1 className="text-3xl font-bold text-nature-800">Bird Watching Dashboard</h1>
      <div className="mt-4 flex flex-wrap gap-4">
        <Button
          variant="outline"
          className="bg-[#223534] text-white hover:bg-[#2a4241]"
          onClick={onToggleUserGuide}
        >
          <FileCode className="mr-2" />
          User Guide (HTML)
        </Button>
        {state.isAdmin && (
          <>
            <Button
              variant="outline"
              className="bg-[#223534] text-white hover:bg-[#2a4241]"
              onClick={onToggleAdminGuide}
            >
              <FileCode className="mr-2" />
              Admin Guide
            </Button>
            <Button
              variant="outline"
              className="bg-[#223534] text-white hover:bg-[#2a4241]"
              onClick={onToggleUsers}
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
  )
}

export default DashboardHeader
