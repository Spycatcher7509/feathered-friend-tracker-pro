
import AddBirdSighting from "@/components/birds/AddBirdSighting"
import { BirdSpeciesManager } from "@/components/birds/BirdSpeciesManager"
import { BirdIdentifier } from "@/components/birds/BirdIdentifier" 
import BirdSpeciesImporter from "@/components/birds/BirdSpeciesImporter"
import ProfileImporter from "@/components/auth/ProfileImporter"
import SupportButtons from "@/components/auth/SupportButtons"
import GoogleDriveBackup from "@/components/backup/GoogleDriveBackup"
import ApiUsageMonitor from "@/components/admin/ApiUsageMonitor"
import BirdSightingsList from "@/components/birds/BirdSightingsList"

interface DashboardToolsProps {
  isAdmin: boolean;
}

const DashboardTools = ({ isAdmin }: DashboardToolsProps) => {
  return (
    <div className="space-y-6">
      <div>
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

      {isAdmin && (
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
  )
}

export default DashboardTools
