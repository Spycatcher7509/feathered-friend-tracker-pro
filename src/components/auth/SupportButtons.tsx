
import { BookOpenText } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { useUserEmail } from "@/hooks/useUserEmail"
import { IssueReportDialog } from "./IssueReportDialog"

const SupportButtons = () => {
  const { toast } = useToast()
  const userEmail = useUserEmail()

  const handleUserGuide = async () => {
    try {
      const link = document.createElement('a')
      link.href = '/BirdWatch-User-Guide.pdf'
      link.download = 'BirdWatch-User-Guide.pdf'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast({
        title: "Success",
        description: "User guide downloaded successfully",
      })
    } catch (error) {
      console.error('Error downloading user guide:', error)
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: "Could not download the user guide. Please try again later.",
      })
    }
  }

  return (
    <div className="flex gap-4 justify-center mt-6">
      <Button
        variant="outline"
        onClick={handleUserGuide}
        className="bg-white hover:bg-nature-50"
      >
        <BookOpenText className="mr-2" />
        User Guide
      </Button>
      
      <IssueReportDialog userEmail={userEmail} />
    </div>
  )
}

export default SupportButtons
