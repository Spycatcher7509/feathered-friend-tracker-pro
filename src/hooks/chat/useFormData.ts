
import { useState } from "react"
import { ChatFormData } from "./types"
import { useToast } from "@/hooks/use-toast"

export const useFormData = (onSubmit: (metadata: ChatFormData) => Promise<void>) => {
  const [formData, setFormData] = useState<ChatFormData>({
    fullName: "",
    email: "",
    description: "",
    attachments: []
  })
  const { toast } = useToast()

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...Array.from(e.target.files || [])]
      }))
    }
  }

  const resetFormData = () => {
    setFormData({
      fullName: "",
      email: "",
      description: "",
      attachments: []
    })
  }

  const handleStartChat = async (e: React.FormEvent) => {
    e.preventDefault()
    // Validate form data
    if (!formData.fullName || !formData.email || !formData.description) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill out all required fields"
      })
      return
    }
    await onSubmit(formData)
  }

  return {
    formData,
    setFormData,
    handleFileUpload,
    handleStartChat,
    resetFormData
  }
}
