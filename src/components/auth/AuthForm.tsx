import { Auth as SupabaseAuth } from "@supabase/auth-ui-react"
import { ThemeSupa } from "@supabase/auth-ui-shared"
import { supabase } from "@/integrations/supabase/client"

const AuthForm = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <SupabaseAuth 
        supabaseClient={supabase}
        appearance={{
          theme: ThemeSupa,
          variables: {
            default: {
              colors: {
                brand: 'rgb(79, 127, 76)',
                brandAccent: 'rgb(61, 102, 58)'
              }
            }
          }
        }}
        providers={[]}
      />
    </div>
  )
}

export default AuthForm