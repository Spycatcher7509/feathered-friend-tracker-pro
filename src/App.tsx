
import { useEffect, useState } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { Session } from "@supabase/supabase-js"

import { supabase } from "./integrations/supabase/client"
import Index from "./pages/Index"
import Auth from "./pages/Auth"
import { UserSupportProvider } from "./components/admin/context/UserSupportContext"

function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <UserSupportProvider>
      <Router>
        <Routes>
          <Route path="/" element={session ? <Index /> : <Navigate to="/auth" replace />} />
          <Route path="/auth" element={!session ? <Auth /> : <Navigate to="/" replace />} />
          {/* Catch all route - redirect to auth page if not authenticated, home page if authenticated */}
          <Route path="*" element={session ? <Navigate to="/" replace /> : <Navigate to="/auth" replace />} />
        </Routes>
      </Router>
    </UserSupportProvider>
  )
}

export default App
