import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Auth as SupabaseAuth } from "@supabase/auth-ui-react"
import { ThemeSupa } from "@supabase/auth-ui-shared"
import { AuthError } from "@supabase/supabase-js"
import { FileText, AlertCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

import { supabase } from "@/integrations/supabase/client"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

const Auth = () => {
  const navigate = useNavigate()
  const [errorMessage, setErrorMessage] = useState("")
  const { toast } = useToast()

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
    window.open("/user-guide.pdf", "_blank")
  }

  const handleReportIssue = async () => {
    try {
      const { error } = await supabase.functions.invoke('send-email', {
        body: {
          to: 'accounts@thewrightsupport.com',
          subject: 'BirdWatch Issue Report',
          text: 'A user has reported an issue with BirdWatch.',
          html: `
            <h2>BirdWatch Issue Report</h2>
            <p>A user has reported an issue with the BirdWatch application.</p>
            <p>Please follow up with the user to gather more details about the issue.</p>
          `
        }
      })

      if (error) throw error

      toast({
        title: "Issue Report Sent",
        description: "Thank you for reporting the issue. Our team will review it shortly.",
      })
    } catch (error) {
      console.error('Error sending issue report:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send issue report. Please try again later.",
      })
    }
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