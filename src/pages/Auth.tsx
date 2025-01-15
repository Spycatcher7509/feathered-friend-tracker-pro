import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Auth as SupabaseAuth } from "@supabase/auth-ui-react"
import { ThemeSupa } from "@supabase/auth-ui-shared"
import { AuthError } from "@supabase/supabase-js"
import { FileText, AlertCircle } from "lucide-react"

import { supabase } from "@/integrations/supabase/client"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

const Auth = () => {
  const navigate = useNavigate()
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session) {
          navigate("/")
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [navigate])

  const getErrorMessage = (error: AuthError) => {
    switch (error.message) {
      case "Invalid login credentials":
        return "Invalid email or password. Please check your credentials and try again."
      case "Email not confirmed":
        return "Please verify your email address before signing in."
      default:
        return error.message
    }
  }

  const handleUserGuide = () => {
    // Open user guide PDF in a new tab
    window.open("/user-guide.pdf", "_blank")
  }

  const handleReportIssue = () => {
    // Open email client with pre-filled subject
    window.location.href = "mailto:accounts@thewrightsupport.com?subject=BirdWatch Issue Report"
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-nature-50 to-nature-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-nature-800">Welcome to BirdWatch</h1>
          <p className="text-nature-600">Sign in to start tracking your bird sightings</p>
        </div>
        
        {errorMessage && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <div className="bg-white p-6 rounded-lg shadow-md">
          <SupabaseAuth 
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: 'rgb(var(--nature-600))',
                    brandAccent: 'rgb(var(--nature-700))'
                  }
                }
              }
            }}
            providers={[]}
          />
        </div>

        <div className="flex gap-4 justify-center mt-6">
          <Button
            variant="outline"
            onClick={handleUserGuide}
            className="bg-white hover:bg-nature-50"
          >
            <FileText className="mr-2" />
            User Guide
          </Button>
          <Button
            variant="outline"
            onClick={handleReportIssue}
            className="bg-white hover:bg-nature-50"
          >
            <AlertCircle className="mr-2" />
            Report Issue
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Auth