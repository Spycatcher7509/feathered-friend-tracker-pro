
import { BookOpenText, AlertCircle } from "lucide-react"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { supabase } from "@/integrations/supabase/client"

const SupportButtons = () => {
  const { toast } = useToast()
  const [issueDescription, setIssueDescription] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSending, setIsSending] = useState(false)

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

      if (!userEmail.trim() || !userEmail.includes('@')) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please provide a valid email address.",
        })
        return
      }

      setIsSending(true)
      toast({
        title: "Sending...",
        description: "Your issue report is being sent.",
      })

      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: 'accounts@thewrightsupport.com',
          subject: 'BirdWatch Issue Report',
          text: `Issue Report from ${userEmail}:\n\n${issueDescription}`,
          html: `
            <h2>BirdWatch Issue Report</h2>
            <p>A user has reported the following issue:</p>
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

      console.log('Email sent successfully:', data)

      // Send an acknowledgment email to the user
      const { error: ackError } = await supabase.functions.invoke('send-email', {
        body: {
          to: userEmail,
          subject: 'BirdWatch Issue Report Received',
          text: `Thank you for reporting the issue. Our team will review it and get back to you shortly.\n\nYour reported issue:\n${issueDescription}`,
          html: `
            <h2>Thank You for Your Issue Report</h2>
            <p>We have received your issue report and our team will review it shortly.</p>
            <p><strong>Your reported issue:</strong></p>
            <p>${issueDescription}</p>
            <p>We will get back to you at this email address: ${userEmail}</p>
          `
        }
      })

      if (ackError) {
        console.error('Error sending acknowledgment email:', ackError)
      }

      toast({
        title: "Issue Report Sent",
        description: "Thank you for reporting the issue. Our team will review it shortly.",
      })

      setIsDialogOpen(false)
      setIssueDescription("")
      setUserEmail("")
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
              <Label htmlFor="email">Your Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address..."
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                required
              />
            </div>
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
