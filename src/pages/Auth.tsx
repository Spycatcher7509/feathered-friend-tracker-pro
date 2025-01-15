import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { AuthError } from "@supabase/supabase-js"
import { supabase } from "@/integrations/supabase/client"
import { Alert, AlertDescription } from "@/components/ui/alert"
import PageLayout from "@/components/layout/PageLayout"
import Header from "@/components/layout/Header"
import AuthForm from "@/components/auth/AuthForm"
import SupportButtons from "@/components/auth/SupportButtons"
import ExternalBirdSounds from "@/components/birds/ExternalBirdSounds"
import ProfileImporter from "@/components/auth/ProfileImporter"
import GoogleDriveBackup from "@/components/backup/GoogleDriveBackup"

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
    <PageLayout header={<Header />}>
      <div className="w-full max-w-md mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-nature-800">Welcome Back</h1>
          <p className="mt-2 text-nature-600">Sign in to continue your bird watching journey</p>
        </div>
        
        {errorMessage && (
          <Alert variant="destructive">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <AuthForm />
        <SupportButtons />
        <div className="pt-4">
          <ProfileImporter />
        </div>
        <div className="pt-4">
          <GoogleDriveBackup />
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-semibold text-nature-800 text-center mb-6">
          Listen to Bird Sounds
        </h2>
        <ExternalBirdSounds />
      </div>
    </PageLayout>
  )
}

export default Auth