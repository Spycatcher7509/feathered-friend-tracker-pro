
import { MessageCircle } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ChatHeader } from "./ChatHeader"
import { ChatContent } from "./ChatContent"
import { useChat } from "@/hooks/chat"
import { useEffect, useState } from "react"

export const Chat = () => {
  const chat = useChat()
  const [isOpen, setIsOpen] = useState(false)

  // Only initialize chat for admin users when they open the chat panel if chat is available
  const handleSheetOpen = (open: boolean) => {
    setIsOpen(open);
    
    // Safely check if chat is available and admin user is detected
    if (open && chat && chat.isAdmin && chat.showForm && typeof chat.initializeConversation === 'function') {
      console.log("Admin detected, auto-initializing conversation");
      // Use a short timeout to ensure all state is properly loaded
      setTimeout(() => {
        if (chat && chat.initializeConversation) {
          try {
            chat.initializeConversation();
          } catch (error) {
            console.error("Failed to initialize conversation:", error);
          }
        }
      }, 300);
    }
  }

  // Add an effect to initialize conversation for admins when component mounts
  useEffect(() => {
    if (chat && isOpen && chat.isAdmin && chat.showForm && typeof chat.initializeConversation === 'function') {
      console.log("Admin user detected on mount, initializing conversation");
      // Use a longer timeout to ensure all state is properly loaded
      setTimeout(() => {
        if (chat && chat.initializeConversation) {
          try {
            chat.initializeConversation();
          } catch (error) {
            console.error("Failed to initialize conversation:", error);
          }
        }
      }, 500);
    }
  }, [chat, isOpen]);

  console.log("Chat component rendered, chat object:", chat ? "available" : "not available", "isAdmin:", chat?.isAdmin);

  return (
    <Sheet onOpenChange={handleSheetOpen}>
      <SheetTrigger asChild>
        <div className="fixed bottom-4 right-4 flex items-center gap-2">
          <span className="bg-white px-3 py-1 rounded-full shadow text-sm">
            Technical Support
          </span>
          <Button
            className="rounded-full w-12 h-12 p-0"
            variant="default"
          >
            <MessageCircle className="h-6 w-6" />
          </Button>
        </div>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] p-0">
        <div className="flex flex-col h-full">
          <ChatHeader 
            showForm={chat?.showForm || true} 
            onEndChat={() => chat?.endConversation?.() || Promise.resolve()} 
          />
          {chat ? (
            <ChatContent chat={chat} />
          ) : (
            <div className="flex-1 flex items-center justify-center p-4">
              Loading chat functionality...
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
