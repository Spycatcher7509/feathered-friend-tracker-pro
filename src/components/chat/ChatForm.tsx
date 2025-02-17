
import React from "react"
import { Video, Mic } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface ChatFormProps {
  formData: {
    fullName: string
    email: string
    description: string
    attachments: File[]
  }
  isLoading: boolean
  onSubmit: (e: React.FormEvent) => Promise<void>
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  onFormDataChange: (updates: Partial<ChatFormProps['formData']>) => void
}

export const ChatForm = ({
  formData,
  isLoading,
  onSubmit,
  onFileUpload,
  onFormDataChange
}: ChatFormProps) => {
  const startVideoCall = () => {
    window.location.href = `tel:+441992924940`
  }

  const startVoiceCall = () => {
    window.location.href = `tel:+441992924940`
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Full Name or Nickname</label>
        <Input
          value={formData.fullName}
          onChange={(e) => onFormDataChange({ fullName: e.target.value })}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Email Address</label>
        <Input
          type="email"
          value={formData.email}
          onChange={(e) => onFormDataChange({ email: e.target.value })}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <Textarea
          value={formData.description}
          onChange={(e) => onFormDataChange({ description: e.target.value })}
          placeholder="Please describe your issue or question..."
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Attachments</label>
        <Input
          type="file"
          onChange={onFileUpload}
          multiple
          className="cursor-pointer"
        />
      </div>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={startVideoCall}
          className="flex-1"
        >
          <Video className="w-4 h-4 mr-2" />
          Video Call
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={startVoiceCall}
          className="flex-1"
        >
          <Mic className="w-4 h-4 mr-2" />
          Voice Call
        </Button>
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Starting chat..." : "Start Chat"}
      </Button>
    </form>
  )
}
