
import { Button } from "@/components/ui/button"
import { Shield, Trash2 } from "lucide-react"

interface UserActionsProps {
  userId: string
  isAdmin: boolean
  onToggleAdmin: (userId: string, currentStatus: boolean) => void
  onDelete: (userId: string) => void
}

export function UserActions({ userId, isAdmin, onToggleAdmin, onDelete }: UserActionsProps) {
  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onToggleAdmin(userId, isAdmin)}
      >
        <Shield className="h-4 w-4 mr-1" />
        {isAdmin ? 'Remove Admin' : 'Make Admin'}
      </Button>
      <Button
        variant="destructive"
        size="sm"
        onClick={() => onDelete(userId)}
      >
        <Trash2 className="h-4 w-4 mr-1" />
        Delete
      </Button>
    </div>
  )
}
