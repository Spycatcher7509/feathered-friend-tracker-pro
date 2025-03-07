
import { BookOpenText, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { useUserEmail } from "@/hooks/useUserEmail"
import { IssueReportDialog } from "./IssueReportDialog"
import { supabase } from "@/integrations/supabase/client"

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
      
      // Only send confirmation email if user is logged in
      if (userEmail) {
        const testEmailData = {
          to: userEmail,
          subject: "BirdWatch Guide Download Confirmation",
          text: "Thank you for downloading the BirdWatch User Guide. If you have any questions, please don't hesitate to contact our support team.",
          html: `
            <h2>BirdWatch Guide Download Confirmation</h2>
            <p>Thank you for downloading the BirdWatch User Guide.</p>
            <p>If you have any questions, please don't hesitate to contact our support team.</p>
            <br>
            <p>Best regards,<br>The BirdWatch Team</p>
          `
        }

        const { error } = await supabase.functions.invoke('send-email', {
          body: testEmailData
        })

        if (error) {
          console.error('Error sending test email:', error)
          throw error
        }

        toast({
          title: "Success",
          description: "User guide downloaded successfully and confirmation email sent",
        })
      } else {
        toast({
          title: "Success",
          description: "User guide downloaded successfully",
        })
      }
    } catch (error) {
      console.error('Error downloading user guide or sending email:', error)
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
        className="bg-[#223534] text-white hover:bg-[#2a4241]"
      >
        <BookOpenText className="mr-2" />
        User Guide (PDF)
      </Button>
      
      <IssueReportDialog userEmail={userEmail} />
    </div>
  )
}

export default SupportButtons
