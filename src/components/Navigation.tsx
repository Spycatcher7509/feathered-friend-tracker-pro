
import { useNavigate } from "react-router-dom"
import { LogOut, Shield } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"

const Navigation = () => {
  const navigate = useNavigate()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const checkAdminStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .maybeSingle()
        
        // If profile exists and is_admin is true, set admin status
        setIsAdmin(profile?.is_admin ?? false)
      }
    }

    checkAdminStatus()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    navigate("/auth")
  }

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="text-xl font-semibold text-nature-800">BirdWatch</div>
        <div className="flex items-center gap-4">
          {isAdmin && (
            <Button
              variant="outline"
              size="sm"
              className="text-nature-600 hover:text-nature-800"
              onClick={() => navigate("/admin")}
            >
              <Shield className="h-5 w-5 mr-2" />
              Admin
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="text-nature-600 hover:text-nature-800"
            onClick={handleSignOut}
          >
            <LogOut className="h-5 w-5 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </nav>
  )
}

export default Navigation
