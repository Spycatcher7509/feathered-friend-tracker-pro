import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
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

export const DisclaimerDialog = () => {
  const [open, setOpen] = useState(true)
  const [agreed, setAgreed] = useState(false)
  const navigate = useNavigate()

  const handleAgree = async () => {
    if (!agreed) return

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('user_disclaimers')
        .upsert({
          user_id: user.id,
          accepted: true,
          accepted_at: new Date().toISOString()
        })

      if (!error) {
        setOpen(false)
      } else {
        console.error('Error saving disclaimer:', error)
      }
    } catch (error) {
      console.error('Error in handleAgree:', error)
    }
  }

  const handleDisagree = async () => {
    await supabase.auth.signOut()
    navigate('/auth')
  }

  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Important Disclaimer</AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <p className="font-bold text-red-600">
              PLEASE READ THIS DISCLAIMER CAREFULLY BEFORE PROCEEDING
            </p>
            <p>
              You are solely responsible for managing and backing up your own data. Neither the developers, administrators, 
              nor any staff members associated with this application assume any responsibility for data loss, corruption, 
              or any consequences arising from the use of this application.
            </p>
            <p>
              By using this application, you acknowledge that:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>You are responsible for maintaining your own data backups</li>
              <li>You will store backups in your own secure location</li>
              <li>No guarantees are made regarding data preservation or recovery</li>
              <li>The application team bears no liability for any data loss</li>
            </ul>
            <div className="flex items-center space-x-2 pt-4">
              <Checkbox 
                id="disclaimer" 
                checked={agreed} 
                onCheckedChange={(checked) => setAgreed(checked as boolean)} 
              />
              <label htmlFor="disclaimer" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                I have read and agree to these terms
              </label>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button
            variant="destructive"
            onClick={handleDisagree}
          >
            I Disagree
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
