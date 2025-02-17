
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

interface RequestBody {
  email: string
  username: string
  location?: string
  experience_level?: string
  is_admin: boolean
}

const validExperienceLevels = ['beginner', 'intermediate', 'advanced', 'expert'] as const

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const body: RequestBody = await req.json()
    
    console.log('Received request body:', body)

    // Validate experience_level more strictly
    if (body.experience_level !== undefined && body.experience_level !== null) {
      if (!validExperienceLevels.includes(body.experience_level as typeof validExperienceLevels[number])) {
        console.error('Invalid experience level:', body.experience_level)
        throw new Error(`Invalid experience level. Must be one of: ${validExperienceLevels.join(', ')}`)
      }
    }

    // First, check if user exists
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
    
    if (listError) throw listError

    const existingUser = users.find(u => u.email === body.email)

    let userId: string

    if (existingUser) {
      // Update existing user
      const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
        existingUser.id,
        {
          email: body.email,
          user_metadata: {
            username: body.username
          }
        }
      )

      if (updateError) throw updateError
      userId = existingUser.id
    } else {
      // Create new user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: body.email,
        email_confirm: true,
        user_metadata: {
          username: body.username
        }
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('No user returned from auth create')
      userId = authData.user.id
    }

    // Prepare profile data with strict typing for experience_level
    const profileData = {
      username: body.username,
      location: body.location,
      experience_level: body.experience_level || null,  // Ensure null if not provided
      is_admin: body.is_admin
    }

    console.log('Updating profile with data:', profileData)

    // Update the profile
    const { error: profileError } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', userId)

    if (profileError) {
      console.error('Profile update error:', profileError)
      throw profileError
    }

    return new Response(
      JSON.stringify({ success: true, userId }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error in create-admin-user:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
