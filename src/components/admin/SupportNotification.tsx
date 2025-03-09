
import { Button } from "@/components/ui/button"
import { Bell } from "lucide-react"

interface SupportNotificationProps {
  hasPendingSupport: boolean
  onCheckSupport: () => void
}

export function SupportNotification({ hasPendingSupport, onCheckSupport }: SupportNotificationProps) {
  if (!hasPendingSupport) return null
  
  return (
    <Button 
      variant="outline" 
      className="flex items-center gap-2 bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100"
      onClick={onCheckSupport}
    >
      <Bell className="h-4 w-4 text-amber-500 animate-pulse" />
      <span>Support Requests</span>
    </Button>
  )
}
