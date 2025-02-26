
import { useState } from 'react'
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supabase } from "@/integrations/supabase/client"
import { AuthError } from '@supabase/supabase-js'

interface AuthFormProps {
  setErrorMessage: (message: string) => void
}

const AuthForm = ({ setErrorMessage }: AuthFormProps) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const { toast } = useToast()

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage("")

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: {
              full_name: fullName || null // Only include if provided
            }
          }
        })

        if (error) {
          const message = getErrorMessage(error)
          setErrorMessage(message)
          toast({
            variant: "destructive",
            title: "Sign Up Error",
            description: message
          })
        } else {
          toast({
            title: "Account created",
            description: "Please check your email to verify your account."
          })
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ 
          email, 
          password 
        })

        if (error) {
          const message = getErrorMessage(error)
          setErrorMessage(message)
          toast({
            variant: "destructive",
            title: "Sign In Error",
            description: message
          })
        } else {
          toast({
            title: "Welcome back!",
            description: "You have been successfully logged in."
          })
        }
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
        {isSignUp && (
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name or Nickname (optional)</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="Enter your name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
        )}
        
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
