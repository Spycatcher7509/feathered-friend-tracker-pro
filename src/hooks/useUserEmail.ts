
import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"

export const useUserEmail = () => {
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    const getUserEmail = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email) {
        setUserEmail(user.email)
      }
    }
    getUserEmail()
  }, [])

  return userEmail
}
