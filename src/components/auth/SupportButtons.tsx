
import { BookOpenText, AlertCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from "@/integrations/supabase/client"

const SupportButtons = () => {
  const { toast } = useToast()
  const [issueDescription, setIssueDescription] = useState("")
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSending, setIsSending] = useState(false)

  useEffect(() => {
    const getUserEmail = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email) {
        setUserEmail(user.email)
      }
    }
    getUserEmail()
  }, [])

  const generateCaseNumber = () => {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    return `BW-${year}${month}${day}-${random}`
  }

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

  const handleReportIssue = async () => {
    try {
      if (!issueDescription.trim()) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please provide a description of the issue.",
        })
        return
      }

      if (!userEmail) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not determine your email address. Please try logging in again.",
        })
        return
      }

      setIsSending(true)
      const caseNumber = generateCaseNumber()

      toast({
        title: "Sending...",
        description: "Your issue report is being sent.",
      })

      // Send issue report to support team
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: 'accounts@thewrightsupport.com',
          subject: `BirdWatch Issue Report - Case ${caseNumber}`,
          text: `Issue Report from ${userEmail}:\nCase Number: ${caseNumber}\n\n${issueDescription}`,
          html: `
            <h2>BirdWatch Issue Report - Case ${caseNumber}</h2>
            <p><strong>Case Number:</strong> ${caseNumber}</p>
            <p><strong>Reporter Email:</strong> ${userEmail}</p>
            <p><strong>Issue Description:</strong></p>
            <p>${issueDescription}</p>
          `
        }
      })

      if (error) {
        console.error('Error response from send-email function:', error)
        throw error
      }

      console.log('Support email sent successfully:', data)

      // Send auto-response to user
      const { error: ackError } = await supabase.functions.invoke('send-email', {
        body: {
          to: userEmail,
          subject: `BirdWatch Support - Case ${caseNumber} Received`,
          text: `
Dear BirdWatch User,

Thank you for contacting BirdWatch Support. This email confirms that we have received your issue report.

Case Number: ${caseNumber}

Your reported issue:
${issueDescription}

We will review your case and respond as soon as possible. Please keep this case number for future reference.

Best regards,
The BirdWatch Support Team
          `,
          html: `
            <h2>BirdWatch Support Confirmation</h2>
            <p>Dear BirdWatch User,</p>
            <p>Thank you for contacting BirdWatch Support. This email confirms that we have received your issue report.</p>
            <p><strong>Case Number:</strong> ${caseNumber}</p>
            <p><strong>Your reported issue:</strong></p>
            <blockquote style="background: #f9f9f9; padding: 15px; border-left: 5px solid #ccc;">
              ${issueDescription}
            </blockquote>
            <p>We will review your case and respond as soon as possible. Please keep this case number for future reference.</p>
            <p>Best regards,<br>The BirdWatch Support Team</p>
          `
        }
      })

      if (ackError) {
        console.error('Error sending acknowledgment email:', ackError)
      }

      toast({
        title: "Issue Report Sent",
        description: `Your case number is ${caseNumber}. We'll respond shortly.`,
      })

      setIsDialogOpen(false)
      setIssueDescription("")
    } catch (error) {
      console.error('Error sending issue report:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to send issue report. Please try again later.",
      })
    } finally {
      setIsSending(false)
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
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="bg-white hover:bg-nature-50"
          >
            <AlertCircle className="mr-2" />
            Report an Issue
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report an Issue</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="issue">Issue Description</Label>
              <Textarea
                id="issue"
                placeholder="Please describe the issue you're experiencing..."
                value={issueDescription}
                onChange={(e) => setIssueDescription(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            <Button 
              onClick={handleReportIssue} 
              className="w-full"
              disabled={isSending}
            >
              {isSending ? "Sending..." : "Submit Report"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default SupportButtons
