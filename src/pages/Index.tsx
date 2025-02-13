
import { useState, useEffect } from "react"
import Navigation from "@/components/Navigation"
import PageLayout from "@/components/layout/PageLayout"
import ProfileImporter from "@/components/auth/ProfileImporter"
import GoogleDriveBackup from "@/components/backup/GoogleDriveBackup"
import ExternalBirdSounds from "@/components/birds/ExternalBirdSounds"
import AddBirdSighting from "@/components/birds/AddBirdSighting"
import BirdSightingsList from "@/components/birds/BirdSightingsList"
import BirdSpeciesImporter from "@/components/birds/BirdSpeciesImporter"
import ApiUsageMonitor from "@/components/admin/ApiUsageMonitor"
import BirdTrends from "@/components/birds/BirdTrends"
import SupportButtons from "@/components/auth/SupportButtons"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, BookOpenText, Shield } from "lucide-react"
import { useAdminGroups } from "@/hooks/useAdminGroups"
import { BirdSpeciesManager } from "@/components/birds/BirdSpeciesManager"
import { BirdIdentifier } from "@/components/birds/BirdIdentifier"
import { useToast } from "@/hooks/use-toast"

const Index = () => {
  const [showBirdSounds, setShowBirdSounds] = useState(false)
  const [showTrends, setShowTrends] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const { checkAdminStatus } = useAdminGroups()
  const { toast } = useToast()

  useEffect(() => {
    const checkAdmin = async () => {
      const adminStatus = await checkAdminStatus()
      setIsAdmin(adminStatus)
    }
    checkAdmin()
  }, [])

  const handleUserGuide = async () => {
    try {
      window.open('/BirdWatch-User-Guide.pdf', '_blank')
      toast({
        title: "Success",
        description: "User guide opened in a new tab",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not open the user guide",
      })
    }
  }

  const handleAdminGuide = async () => {
    try {
      if (isAdmin) {
        window.open('/BirdWatch-Admin-Guide.pdf', '_blank')
        toast({
          title: "Success",
          description: "Admin guide opened in a new tab",
        })
      } else {
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "You need admin privileges to view this guide",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not open the admin guide",
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
              <div className="mt-4 flex gap-4">
                <Button
                  variant="outline"
                  className="bg-[#223534] text-white hover:bg-[#2a4241]"
                  onClick={handleUserGuide}
                >
                  <BookOpenText className="mr-2" />
                  User Guide
                </Button>
                {isAdmin && (
                  <Button
                    variant="outline"
                    className="bg-[#223534] text-white hover:bg-[#2a4241]"
                    onClick={handleAdminGuide}
                  >
                    <Shield className="mr-2" />
                    Admin Guide
                  </Button>
                )}
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <AddBirdSighting />
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <GoogleDriveBackup />
                </div>
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
            <div className="bg-white rounded-lg shadow p-6">
              <ApiUsageMonitor />
            </div>
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
    </PageLayout>
  )
}

export default Index
