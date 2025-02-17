
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { AuthError, AuthChangeEvent, User } from "@supabase/supabase-js"
import { supabase } from "@/integrations/supabase/client"
import { Alert, AlertDescription } from "@/components/ui/alert"
import PageLayout from "@/components/layout/PageLayout"
import Header from "@/components/layout/Header"
import AuthForm from "@/components/auth/AuthForm"
import SupportButtons from "@/components/auth/SupportButtons"

const Auth = () => {
  const navigate = useNavigate()
  const [errorMessage, setErrorMessage] = useState("")
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user)
        navigate("/")
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session) => {
        if (event === "SIGNED_IN" && session) {
          setUser(session.user)
          navigate("/")
        } else if (event === "SIGNED_OUT") {
          setUser(null)
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

  // If user is already logged in, redirect to home
  if (user) {
    return null
  }

  return (
    <PageLayout header={<Header />}>
      <div className="w-full max-w-md mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-nature-800">Feathered Friend Tracker</h1>
          <p className="mt-2 text-nature-600">Sign in to continue your bird watching journey</p>
        </div>
        
        {errorMessage && (
          <Alert variant="destructive">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <AuthForm setErrorMessage={setErrorMessage} />
        <SupportButtons />
      </div>
    </PageLayout>
  )
}

export default Auth
