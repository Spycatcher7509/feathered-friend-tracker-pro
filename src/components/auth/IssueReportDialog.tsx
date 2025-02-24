
import { useState } from "react"
import { AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from "@/integrations/supabase/client"
import { generateCaseNumber, generateSupportEmailContent } from "@/utils/support"
import { sendDiscordWebhookMessage } from "@/utils/discord"
import { format } from "date-fns"

interface IssueReportDialogProps {
  userEmail: string | null
}

export const IssueReportDialog = ({ userEmail }: IssueReportDialogProps) => {
  const { toast } = useToast()
  const [issueDescription, setIssueDescription] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSending, setIsSending] = useState(false)

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
      const reportedAt = new Date()
      const formattedDate = format(reportedAt, "MMMM d, yyyy 'at' h:mm a")

      toast({
        title: "Sending...",
        description: "Your issue report is being sent.",
      })

      // Get the current user's ID
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error("User not authenticated")
      }

      // Get support team email from configuration
      const { data: supportConfig, error: configError } = await supabase
        .from('support_team_config')
        .select('support_email')
        .maybeSingle()

      if (configError) {
        console.error('Error fetching support team config:', configError)
        throw new Error("Could not fetch support team configuration")
      }

      const supportEmail = supportConfig?.support_email || 'accounts@thewrightsupport.com'

      // Store issue in database - status will default to 'open'
      const { error: dbError } = await supabase
        .from('issues')
        .insert({
          user_id: user.id,
          description: issueDescription
        })

      if (dbError) {
        console.error('Error storing issue in database:', dbError)
        throw dbError
      }

      const emailContent = generateSupportEmailContent(caseNumber, userEmail, issueDescription)

      // Send issue report to support team
      const { error: supportEmailError } = await supabase.functions.invoke('send-email', {
        body: {
          ...emailContent.supportEmail,
          to: supportEmail
        }
      })

      if (supportEmailError) {
        console.error('Error sending support email:', supportEmailError)
        throw supportEmailError
      }

      // Send auto-response to user
      const { error: ackError } = await supabase.functions.invoke('send-email', {
        body: emailContent.userEmail
      })

      if (ackError) {
        console.error('Error sending acknowledgment email:', ackError)
        throw ackError
      }

      try {
        // Send Discord notification
        await sendDiscordWebhookMessage(`🎫 New Issue Report (${caseNumber})
📅 Reported: ${formattedDate}
📧 Reporter: ${userEmail}
📝 Description: ${issueDescription}

Our support team will respond within 48 hours.`, "support")
      } catch (discordError) {
        console.error('Error sending Discord notification:', discordError)
        // Don't throw the error as this is not critical for the user
      }

      toast({
        title: "Issue Report Sent",
        description: `Case #${caseNumber} - ${formattedDate}

Your reported issue:
"${issueDescription}"

Our support team will get back to you within 48 hours.`,
      })

      // Close dialog first, then reset description
      setIsDialogOpen(false)
      setTimeout(() => setIssueDescription(""), 100)
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
    <Dialog 
      open={isDialogOpen} 
      onOpenChange={(open) => {
        setIsDialogOpen(open)
        if (!open) {
          setTimeout(() => setIssueDescription(""), 100)
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="bg-[#223534] text-white hover:bg-[#2a4241]"
        >
          <AlertCircle className="mr-2" />
          Report an Issue
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle className="text-gray-900">Report an Issue</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="issue" className="text-gray-700">Issue Description</Label>
            <Textarea
              id="issue"
              placeholder="Please describe the issue you're experiencing..."
              value={issueDescription}
              onChange={(e) => setIssueDescription(e.target.value)}
              className="min-h-[100px] w-full bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 resize-none"
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
  )
}
