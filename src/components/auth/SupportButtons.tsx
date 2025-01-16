import { BookOpenText, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { supabase } from "@/integrations/supabase/client"

const SupportButtons = () => {
  const { toast } = useToast()

  const handleUserGuide = async () => {
    try {
      const { data, error } = await supabase.storage
        .from('user-guides')
        .download('birdwatch-guide.pdf')

      if (error) throw error

      // Create a blob URL from the downloaded data
      const blob = new Blob([data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      
      // Create a temporary link and trigger download
      const link = document.createElement('a')
      link.href = url
      link.download = 'BirdWatch-User-Guide.pdf'
      document.body.appendChild(link)
      link.click()
      
      // Cleanup
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
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

  const handleReportIssue = async () => {
    try {
      const { error } = await supabase.functions.invoke('send-email', {
        body: {
          to: 'accounts@thewrightsupport.com',
          subject: 'BirdWatch Issue Report',
          text: 'A user has reported an issue with BirdWatch.',
          html: `
            <h2>BirdWatch Issue Report</h2>
            <p>A user has reported an issue with the BirdWatch application.</p>
            <p>Please follow up with the user to gather more details about the issue.</p>
          `
        }
      })

      if (error) throw error

      toast({
        title: "Issue Report Sent",
        description: "Thank you for reporting the issue. Our team will review it shortly.",
      })
    } catch (error) {
      console.error('Error sending issue report:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send issue report. Please try again later.",
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
      <Button
        variant="outline"
        onClick={handleReportIssue}
        className="bg-white hover:bg-nature-50"
      >
        <AlertCircle className="mr-2" />
        Report an Issue
      </Button>
    </div>
  )
}

export default SupportButtons