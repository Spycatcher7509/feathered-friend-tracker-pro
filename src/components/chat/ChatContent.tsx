
import { ChatForm } from "./ChatForm"
import { MessagesList } from "./MessagesList"
import { MessageInput } from "./MessageInput"
import { useChat } from "@/hooks/chat"

interface ChatContentProps {
  chat: ReturnType<typeof useChat>
}

export const ChatContent = ({ chat }: ChatContentProps) => {
  return (
    <>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chat.showForm ? (
          <ChatForm
            formData={chat.formData}
            isLoading={chat.isLoading}
            onSubmit={chat.handleStartChat}
            onFileUpload={chat.handleFileUpload}
            onFormDataChange={(updates) => chat.setFormData(prev => ({ ...prev, ...updates }))}
          />
        ) : (
          <MessagesList
            messages={chat.messages}
            isLoading={chat.isLoading}
          />
        )}
      </div>

      {!chat.showForm && (
        <div className="p-4 border-t">
          <MessageInput
            value={chat.newMessage}
            onChange={(e) => chat.setNewMessage(e.target.value)}
            onSend={chat.sendMessage}
            disabled={chat.isLoading || chat.isSending}
          />
        </div>
      )}
    </>
  )
}
