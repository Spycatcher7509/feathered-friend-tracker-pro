
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

interface ContactFormProps {
  issueDescription: string
  setIssueDescription: (value: string) => void
  setIsDialogOpen: (value: boolean) => void
}

export const ContactForm = ({
  issueDescription,
  setIssueDescription,
  setIsDialogOpen
}: ContactFormProps) => {
  const { toast } = useToast()
  const [netlifyFormData, setNetlifyFormData] = useState({
    name: "",
    email: ""
  })

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
  )
}
