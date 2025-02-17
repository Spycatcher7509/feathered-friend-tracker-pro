
import React from "react"

interface Message {
  id: string
  content: string
  is_system_message: boolean
  created_at: string
}

interface MessagesListProps {
  messages: Message[]
  isLoading: boolean
}

export const MessagesList = ({ messages, isLoading }: MessagesListProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-muted-foreground">
          Loading messages...
        </div>
      </div>
    )
  }

  return (
    <>
      {messages.map((message, index) => (
        <div
          key={index}
          className={`flex ${message.is_system_message ? 'justify-start' : 'justify-end'}`}
        >
          <div
            className={`max-w-[80%] p-3 rounded-lg ${
              message.is_system_message
                ? 'bg-gray-100'
                : 'bg-blue-500 text-white'
            }`}
          >
            {message.content}
          </div>
        </div>
      ))}
    </>
  )
}
