
import { Button } from "@/components/ui/button"
import { Bell } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useEffect, useState } from "react"

interface SupportNotificationProps {
  hasPendingSupport: boolean
  onCheckSupport: () => void
}

export function SupportNotification({ hasPendingSupport, onCheckSupport }: SupportNotificationProps) {
  const { toast } = useToast()
  const [notified, setNotified] = useState(false)
  
  useEffect(() => {
    if (hasPendingSupport && !notified) {
      // Notify with sound
      const audio = new Audio('/notification.mp3')
      audio.play().catch(error => console.error('Error playing notification sound:', error))
      
      // Show toast
      toast({
        title: "New Support Request",
        description: "A user is requesting technical support",
        variant: "default",
      })
      
      setNotified(true)
    }
    
    if (!hasPendingSupport) {
      setNotified(false)
    }
  }, [hasPendingSupport, notified, toast])
  
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
