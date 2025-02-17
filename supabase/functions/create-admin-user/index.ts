
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

// Important: Must match exactly what's in the database constraint
const validExperienceLevels = ['beginner', 'intermediate', 'advanced', 'expert'] as const
type ExperienceLevel = typeof validExperienceLevels[number]

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
    if (body.experience_level) {
      if (!validExperienceLevels.includes(body.experience_level as ExperienceLevel)) {
        console.error('Invalid experience level:', body.experience_level)
        throw new Error(`Invalid experience level. Must be one of: ${validExperienceLevels.join(', ')}`)
      }
    }

    // First, create or update auth user
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
    
    if (listError) throw listError

    const existingUser = users.find(u => u.email === body.email)
    let userId: string

    if (existingUser) {
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        existingUser.id,
        {
          email: body.email,
          user_metadata: { username: body.username }
        }
      )
      if (updateError) throw updateError
      userId = existingUser.id
    } else {
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: body.email,
        email_confirm: true,
        user_metadata: { username: body.username }
      })
      if (createError) throw createError
      if (!newUser.user) throw new Error('No user returned from auth create')
      userId = newUser.user.id
    }

    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single()

    // Prepare profile data
    const profileData = {
      id: userId,
      username: body.username,
      email: body.email,
      location: body.location || null,
      experience_level: body.experience_level || null,
      is_admin: body.is_admin
    }

    if (existingProfile) {
      // Update existing profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', userId)
      
      if (updateError) {
        console.error('Profile update error:', updateError)
        throw updateError
      }
    } else {
      // Insert new profile
      const { error: insertError } = await supabase
        .from('profiles')
        .insert([profileData])
      
      if (insertError) {
        console.error('Profile insert error:', insertError)
        throw insertError
      }
    }

    return new Response(
      JSON.stringify({ success: true, userId }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in create-admin-user:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
