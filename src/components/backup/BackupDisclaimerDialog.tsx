
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { supabase } from "@/integrations/supabase/client"

interface BackupDisclaimerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAccept: () => void
  onCancel: () => void
  type: 'backup' | 'restore'
}

export const BackupDisclaimerDialog = ({
  open,
  onOpenChange,
  onAccept,
  onCancel,
  type
}: BackupDisclaimerDialogProps) => {
  const [agreed, setAgreed] = useState(false)
  const { toast } = useToast()

  const handleAgree = async () => {
    if (!agreed) return

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to perform this operation",
          variant: "destructive",
        })
        return
      }

      const { data: existingDisclaimer } = await supabase
        .from('backup_disclaimers')
        .select()
        .eq('user_id', user.id)
        .maybeSingle()

      if (!existingDisclaimer) {
        const { error } = await supabase
          .from('backup_disclaimers')
          .insert({
            user_id: user.id
          })

        if (error) {
          console.error('Error saving disclaimer:', error)
          toast({
            title: "Error",
            description: "Failed to save your acknowledgment",
            variant: "destructive",
          })
          return
        }
      }

      onAccept()
      onOpenChange(false)
    } catch (error) {
      console.error('Error in handleAgree:', error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  const handleCancel = () => {
    onCancel()
    onOpenChange(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Important Disclaimer</AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <p className="font-bold text-red-600">
              PLEASE READ THIS DISCLAIMER CAREFULLY BEFORE PROCEEDING WITH THE {type.toUpperCase()} OPERATION
            </p>
            <p>
              You are solely responsible for managing and backing up your own data. By proceeding with this {type} operation:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>You acknowledge that you are responsible for maintaining your own data backups</li>
              <li>You understand the risks involved in {type === 'backup' ? 'creating' : 'restoring from'} local backups</li>
              <li>You accept that no guarantees are made regarding data preservation or recovery</li>
              <li>You agree that the application team bears no liability for any data loss</li>
            </ul>
            <div className="flex items-center space-x-2 pt-4">
              <Checkbox 
                id="disclaimer" 
                checked={agreed} 
                onCheckedChange={(checked) => setAgreed(checked as boolean)} 
              />
              <label 
                htmlFor="disclaimer" 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I have read and agree to these terms
              </label>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAgree}
            disabled={!agreed}
          >
            I Agree
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
