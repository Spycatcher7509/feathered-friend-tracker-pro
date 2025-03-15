
import { useState, useEffect } from "react"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { IssueReportForm } from "./IssueReportForm"
import { ContactForm } from "./ContactForm"

interface IssueReportDialogProps {
  userEmail: string | null
}

export const IssueReportDialog = ({ userEmail }: IssueReportDialogProps) => {
  const [issueDescription, setIssueDescription] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(!!userEmail)

  useEffect(() => {
    setIsAuthenticated(!!userEmail)
  }, [userEmail])

  return (
    <Dialog 
      open={isDialogOpen} 
      onOpenChange={(open) => {
        setIsDialogOpen(open)
        if (!open) {
          setTimeout(() => {
            setIssueDescription("")
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
          <IssueReportForm 
            userEmail={userEmail as string} 
            setIsDialogOpen={setIsDialogOpen}
          />
        ) : (
          <ContactForm 
            issueDescription={issueDescription}
            setIssueDescription={setIssueDescription}
            setIsDialogOpen={setIsDialogOpen}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
