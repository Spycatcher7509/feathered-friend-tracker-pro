
import { useState } from 'react'
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supabase } from "@/integrations/supabase/client"

interface AuthFormProps {
  setErrorMessage: (message: string) => void
}

const AuthForm = ({ setErrorMessage }: AuthFormProps) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage("")

    try {
      const { error } = isSignUp 
        ? await supabase.auth.signUp({ 
            email, 
            password,
            options: {
              emailRedirectTo: window.location.origin
            }
          })
        : await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        setErrorMessage(error.message)
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: error.message
        })
      } else {
        toast({
          title: isSignUp ? "Account created" : "Welcome back!",
          description: isSignUp 
            ? "Please check your email to verify your account." 
            : "You have been successfully logged in."
        })
      }
    } catch (error) {
      const message = "An unexpected error occurred. Please try again."
      setErrorMessage(message)
      toast({
        variant: "destructive",
        title: "Error",
        description: message
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>

        <Button 
          type="submit" 
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? "Loading..." : (isSignUp ? "Sign Up" : "Sign In")}
        </Button>

        <Button
          type="button"
          variant="link"
          className="w-full"
          onClick={() => setIsSignUp(!isSignUp)}
        >
          {isSignUp 
            ? "Already have an account? Sign In" 
            : "Don't have an account? Sign Up"}
        </Button>
      </form>
    </div>
  )
}

export default AuthForm
