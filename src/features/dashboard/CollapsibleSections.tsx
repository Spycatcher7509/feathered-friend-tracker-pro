
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp } from "lucide-react"
import BirdTrends from "@/components/birds/BirdTrends"
import ExternalBirdSounds from "@/components/birds/ExternalBirdSounds"
import { DashboardState } from "./dashboardReducer"

interface CollapsibleSectionsProps {
  state: DashboardState;
  onToggleTrends: () => void;
  onToggleBirdSounds: () => void;
}

const CollapsibleSections = ({ 
  state, 
  onToggleTrends, 
  onToggleBirdSounds 
}: CollapsibleSectionsProps) => {
  return (
    <div className="space-y-4">
      <Button
        variant="outline"
        onClick={onToggleTrends}
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
        onClick={onToggleBirdSounds}
        className="w-full flex justify-between items-center py-6"
      >
        <span className="text-xl font-semibold">Listen to Bird Sounds</span>
        {state.showBirdSounds ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
      </Button>

      {state.showBirdSounds && <ExternalBirdSounds />}
    </div>
  )
}

export default CollapsibleSections
