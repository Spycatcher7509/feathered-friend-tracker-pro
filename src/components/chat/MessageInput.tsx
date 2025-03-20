
import React, { KeyboardEvent } from "react"
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
  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && value.trim()) {
      e.preventDefault()
      onSend()
    }
  }

  return (
    <div className="flex gap-2">
      <Input
        value={value}
        onChange={onChange}
        onKeyPress={handleKeyPress}
        placeholder="Type your message..."
        disabled={disabled}
        className="flex-1"
        autoFocus
      />
      <Button 
        onClick={onSend}
        disabled={disabled || !value.trim()}
        className="shrink-0"
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  )
}
