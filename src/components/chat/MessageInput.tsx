
import React from "react"
import { Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface MessageInputProps {
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSend: () => void
  disabled: boolean
}

export const MessageInput = ({
  value,
  onChange,
  onSend,
  disabled
}: MessageInputProps) => {
  return (
    <div className="flex gap-2">
      <Input
        value={value}
        onChange={onChange}
        onKeyPress={(e) => e.key === 'Enter' && onSend()}
        placeholder="Type your message..."
        disabled={disabled}
      />
      <Button 
        onClick={onSend}
        disabled={disabled}
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  )
}
