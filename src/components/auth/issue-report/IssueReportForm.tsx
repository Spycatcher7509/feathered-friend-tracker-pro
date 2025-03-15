
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { IssueForm } from "./IssueForm"
import { submitIssueReport, IssueReportResult } from "./issueReportService"

interface IssueReportFormProps {
  userEmail: string
  setIsDialogOpen: (value: boolean) => void
}

export const IssueReportForm = ({ userEmail, setIsDialogOpen }: IssueReportFormProps) => {
  const { toast } = useToast()
  const [issueDescription, setIssueDescription] = useState("")
  const [isSending, setIsSending] = useState(false)

  const handleReportIssue = async () => {
    if (!issueDescription.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please provide a description of the issue.",
      })
      return
    }

    setIsSending(true)
    
    toast({
      title: "Sending...",
      description: "Your issue report is being sent.",
    })

    const result: IssueReportResult = await submitIssueReport(userEmail, issueDescription)
    
    setIsSending(false)

    if (result.success && result.caseNumber && result.formattedDate) {
      toast({
        title: "Issue Report Sent",
        description: `Case #${result.caseNumber} - ${result.formattedDate}

Your reported issue:
"${issueDescription}"

Our support team will get back to you within 48 hours.`,
      })

      // Close dialog first, then reset description
      setIsDialogOpen(false)
      setTimeout(() => setIssueDescription(""), 100)
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error?.message || "Failed to send issue report. Please try again later.",
      })
    }
  }

  return (
    <IssueForm
      issueDescription={issueDescription}
      setIssueDescription={setIssueDescription}
      onSubmit={handleReportIssue}
      isSending={isSending}
    />
  )
}
