
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

  // Auto-start chat for admin users when they open the chat panel
  const handleSheetOpen = (open: boolean) => {
    setIsOpen(open);
    if (open && chat.isAdmin && chat.showForm) {
      // For admin users, we auto-initialize the conversation without form data
      console.log("Admin detected, auto-initializing conversation");
      chat.initializeConversation();
    }
  }

  // Add an effect to initialize conversation for admins when component mounts
  useEffect(() => {
    if (isOpen && chat.isAdmin && chat.showForm) {
      console.log("Admin user detected on mount, initializing conversation");
      chat.initializeConversation();
    }
  }, [chat.isAdmin, chat.showForm, isOpen]);

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
            showForm={chat.showForm} 
            onEndChat={chat.endConversation} 
          />
          <ChatContent chat={chat} />
        </div>
      </SheetContent>
    </Sheet>
  )
}
