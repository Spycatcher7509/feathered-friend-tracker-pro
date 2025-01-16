import Navigation from "@/components/Navigation"
import PageLayout from "@/components/layout/PageLayout"
import ProfileImporter from "@/components/auth/ProfileImporter"
import GoogleDriveBackup from "@/components/backup/GoogleDriveBackup"
import ExternalBirdSounds from "@/components/birds/ExternalBirdSounds"

const Index = () => {
  return (
    <PageLayout header={<Navigation />}>
      <div className="container mx-auto px-4 py-8 space-y-12">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-nature-800">Bird Watching Dashboard</h1>
            <ProfileImporter />
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <GoogleDriveBackup />
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-nature-800">
            Listen to Bird Sounds
          </h2>
          <ExternalBirdSounds />
        </div>
      </div>
    </PageLayout>
  )
}

export default Index