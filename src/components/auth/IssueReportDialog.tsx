
import { useState, useEffect } from "react"
import { AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
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
  const [isAuthenticated, setIsAuthenticated] = useState(!!userEmail)
  const [netlifyFormData, setNetlifyFormData] = useState({
    name: "",
    email: ""
  })

  useEffect(() => {
    setIsAuthenticated(!!userEmail)
  }, [userEmail])

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

  const handleNetlifyFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!netlifyFormData.name || !netlifyFormData.email || !issueDescription) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill out all fields",
      })
      return
    }
    
    // The form has the netlify attribute, but we need to handle submission via JS
    const form = e.target as HTMLFormElement
    const formData = new FormData(form)
    
    fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(formData as any).toString()
    })
      .then(() => {
        toast({
          title: "Form Submitted",
          description: "Thank you for contacting us. We will get back to you soon.",
        })
        setIsDialogOpen(false)
        setNetlifyFormData({ name: "", email: "" })
        setIssueDescription("")
      })
      .catch(error => {
        console.error('Error submitting form:', error)
        toast({
          variant: "destructive",
          title: "Submission Error",
          description: "There was a problem submitting your form. Please try again.",
        })
      })
  }

  return (
    <Dialog 
      open={isDialogOpen} 
      onOpenChange={(open) => {
        setIsDialogOpen(open)
        if (!open) {
          setTimeout(() => {
            setIssueDescription("")
            setNetlifyFormData({ name: "", email: "" })
          }, 100)
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="bg-[#223534] text-white hover:bg-[#2a4241]"
        >
          <AlertCircle className="mr-2" />
          {isAuthenticated ? "Report an Issue" : "Contact Support"}
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle className="text-gray-900">
            {isAuthenticated ? "Report an Issue" : "Contact Support"}
          </DialogTitle>
        </DialogHeader>
        
        {isAuthenticated ? (
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
        ) : (
          <form 
            name="contact" 
            method="POST" 
            data-netlify="true"
            netlify-honeypot="bot-field"
            className="space-y-4 mt-4"
            onSubmit={handleNetlifyFormSubmit}
          >
            <input type="hidden" name="form-name" value="contact" />
            <p className="hidden">
              <label>
                Don't fill this out if you're human: <input name="bot-field" />
              </label>
            </p>
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-700">Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                required
                value={netlifyFormData.name}
                onChange={(e) => setNetlifyFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full bg-white border-gray-300 text-gray-900"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={netlifyFormData.email}
                onChange={(e) => setNetlifyFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full bg-white border-gray-300 text-gray-900"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message" className="text-gray-700">Message</Label>
              <Textarea
                id="message"
                name="message"
                placeholder="Please describe your issue or question..."
                required
                value={issueDescription}
                onChange={(e) => setIssueDescription(e.target.value)}
                className="min-h-[100px] w-full bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 resize-none"
              />
            </div>
            <Button 
              type="submit"
              className="w-full"
            >
              Send
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
