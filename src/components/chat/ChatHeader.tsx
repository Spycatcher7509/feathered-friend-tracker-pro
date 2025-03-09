
import { Button } from "@/components/ui/button"

interface ChatHeaderProps {
  showForm: boolean
  onEndChat: () => Promise<void>
}

export const ChatHeader = ({ showForm, onEndChat }: ChatHeaderProps) => {
  return (
    <div className="p-4 border-b">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Support Chat</h2>
        {!showForm && (
          <Button
            variant="destructive"
            size="sm"
            onClick={onEndChat}
          >
            End Chat
          </Button>
        )}
      </div>
    </div>
  )
}
