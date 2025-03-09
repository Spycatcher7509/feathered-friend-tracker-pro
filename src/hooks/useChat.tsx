
import { useChat } from "./chat"

// Re-export the useChat hook from the new location
export { useChat }

// This is for backwards compatibility
export type { ChatFormData } from "./chat/types"
