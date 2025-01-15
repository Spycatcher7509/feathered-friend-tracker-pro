import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { AuthError } from "@supabase/supabase-js"
import { supabase } from "@/integrations/supabase/client"
import { Alert, AlertDescription } from "@/components/ui/alert"
import PageLayout from "@/components/layout/PageLayout"
import AuthForm from "@/components/auth/AuthForm"
import SupportButtons from "@/components/auth/SupportButtons"

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

  return (
    <PageLayout>
      <div className="w-full max-w-md mx-auto space-y-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-nature-800">Welcome to BirdWatch</h1>
          <p className="text-nature-600">Sign in to start tracking your bird sightings</p>
        </div>
        
        {errorMessage && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <AuthForm />
        <SupportButtons />
      </div>
    </PageLayout>
  )
}

export default Auth