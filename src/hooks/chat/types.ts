
import { PostgrestError } from "@supabase/supabase-js"

export interface ChatFormData {
  fullName: string
  email: string
  description: string
  attachments: File[]
}

export interface Message {
  id: string
  content: string
  is_system_message: boolean
  created_at: string
  conversation_id: string
  user_id: string
}

export interface Conversation {
  id: string
  user_id: string
  status: 'active' | 'closed'
  created_at: string
}

export interface ConversationMetadata {
  id: string
  conversation_id: string
  full_name: string
  email: string
  description: string
  attachments: string[]
}

export interface ChatHookReturn {
  messages: Message[]
  newMessage: string
  setNewMessage: (message: string) => void
  isLoading: boolean
  isSending: boolean
  showForm: boolean
  formData: ChatFormData
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleStartChat: (e: React.FormEvent) => Promise<void>
  sendMessage: () => Promise<void>
  endConversation: () => Promise<void> // This expects a void return
  setFormData: React.Dispatch<React.SetStateAction<ChatFormData>>
  isAdmin?: boolean
  initializeConversation: (metadata?: ChatFormData) => Promise<void>
}
