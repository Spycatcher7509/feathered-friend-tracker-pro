
import React, { useEffect, useRef } from "react"
import { Message } from "@/hooks/chat/types"

interface MessagesListProps {
  messages: Message[]
  isLoading: boolean
}

export const MessagesList = ({ messages, isLoading }: MessagesListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // Auto-scroll to the most recent message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-muted-foreground">
          Loading messages...
        </div>
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">
          No messages yet. Start the conversation!
        </div>
      </div>
    )
  }

  return (
    <>
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.is_system_message ? 'justify-center' : 
            (message.user_id === 'admin' ? 'justify-start' : 'justify-end')}`}
        >
          <div
            className={`max-w-[80%] p-3 rounded-lg ${
              message.is_system_message
                ? 'bg-gray-100 text-gray-700 text-sm'
                : message.user_id === 'admin'
                ? 'bg-gray-200 text-gray-800'
                : 'bg-blue-500 text-white'
            }`}
          >
            {message.content}
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </>
  )
}
