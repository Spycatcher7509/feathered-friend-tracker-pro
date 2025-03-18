
import { BookOpenText, AlertCircle, Mail } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { useUserEmail } from "@/hooks/useUserEmail"
import { IssueReportDialog } from "./issue-report/IssueReportDialog"
import { supabase } from "@/integrations/supabase/client"
import { generateTestEmailContent } from "@/utils/support"

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

  const handleTestEmail = async () => {
    if (!userEmail) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please log in to test the email functionality.",
      })
      return
    }

    toast({
      title: "Sending Test Email",
      description: "Attempting to send test emails...",
    })

    try {
      // Use fixed support email address
      const supportEmail = 'support@featheredfriendtracker.co.uk'
      console.log('Using support email address:', supportEmail)
      
      // Create test email content
      const emailContent = generateTestEmailContent(userEmail)
      
      // Send test email to support team
      console.log('Sending test email to support team:', supportEmail)
      const { data: supportEmailData, error: supportEmailError } = await supabase.functions.invoke('send-email', {
        body: {
          to: supportEmail,
          subject: emailContent.supportEmail.subject,
          text: emailContent.supportEmail.text,
          html: emailContent.supportEmail.html
        }
      })

      if (supportEmailError) {
        console.error('Error sending test email to support:', supportEmailError)
        throw new Error(`Support email error: ${supportEmailError.message}`)
      }
      
      console.log('Support test email response:', supportEmailData)
      
      // Send confirmation to user
      console.log('Sending test confirmation to user:', userEmail)
      const { data: userEmailData, error: userEmailError } = await supabase.functions.invoke('send-email', {
        body: {
          to: userEmail,
          subject: emailContent.userEmail.subject,
          text: emailContent.userEmail.text,
          html: emailContent.userEmail.html
        }
      })

      if (userEmailError) {
        console.error('Error sending test confirmation to user:', userEmailError)
        throw new Error(`User email error: ${userEmailError.message}`)
      }
      
      console.log('User test email response:', userEmailData)

      toast({
        title: "Test Successful",
        description: `Test emails have been sent to support team (${supportEmail}) and your email address (${userEmail}).`,
      })
    } catch (error) {
      console.error('Error in test email process:', error)
      toast({
        variant: "destructive",
        title: "Test Failed",
        description: error instanceof Error ? error.message : "Could not send test emails. Please try again later.",
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
      
      <Button
        variant="outline"
        onClick={handleTestEmail}
        className="bg-[#223534] text-white hover:bg-[#2a4241]"
      >
        <Mail className="mr-2" />
        Test Support Email
      </Button>
    </div>
  )
}

export default SupportButtons
