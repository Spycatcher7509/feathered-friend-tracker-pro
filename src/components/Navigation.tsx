
import { useNavigate } from "react-router-dom"
import { LogOut, Shield, BookOpenText } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { useAdminGroups } from "@/hooks/useAdminGroups"
import { useToast } from "@/hooks/use-toast"

const Navigation = () => {
  const navigate = useNavigate()
  const [isAdmin, setIsAdmin] = useState(false)
  const { checkAdminStatus } = useAdminGroups()
  const { toast } = useToast()

  useEffect(() => {
    const checkAdmin = async () => {
      const adminStatus = await checkAdminStatus()
      setIsAdmin(adminStatus)
    }

    checkAdmin()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    navigate("/auth")
  }

  const handleAdminGuide = async () => {
    try {
      const link = document.createElement('a')
      link.href = '/BirdWatch-Admin-Guide.pdf'
      link.download = 'BirdWatch-Admin-Guide.pdf'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast({
        title: "Success",
        description: "Admin guide downloaded successfully",
      })
    } catch (error) {
      console.error('Error downloading admin guide:', error)
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: "Could not download the admin guide. Please try again later.",
      })
    }
  }

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="text-xl font-semibold text-nature-800">BirdWatch</div>
        <div className="flex items-center gap-4">
          {isAdmin && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="text-nature-600 hover:text-nature-800"
                onClick={() => navigate("/admin")}
              >
                <Shield className="h-5 w-5 mr-2" />
                Admin
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-nature-600 hover:text-nature-800"
                onClick={handleAdminGuide}
              >
                <BookOpenText className="h-5 w-5 mr-2" />
                Admin Guide
              </Button>
            </>
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
