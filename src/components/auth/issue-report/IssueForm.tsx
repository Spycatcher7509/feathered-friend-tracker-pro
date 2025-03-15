
import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

interface IssueFormProps {
  issueDescription: string
  setIssueDescription: (value: string) => void
  onSubmit: () => void
  isSending: boolean
}

export const IssueForm = ({ 
  issueDescription, 
  setIssueDescription, 
  onSubmit, 
  isSending 
}: IssueFormProps) => {
  return (
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
        onClick={onSubmit} 
        className="w-full"
        disabled={isSending}
      >
        {isSending ? "Sending..." : "Submit Report"}
      </Button>
    </div>
  )
}
