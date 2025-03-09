
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { parse } from 'https://deno.land/std@0.181.0/encoding/csv.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No file uploaded' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const text = await file.text()
    const records = parse(text, { skipFirstRow: true }) as string[][]

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const profiles = records.map(([
      username,
      datetime,  // New date and time field
      bio,
      location,
      experience_level,
      preferred_birds,
      picture,  // New picture field
      bird_song, // New bird song field
      comment    // New comment field
    ]) => ({
      username,
      bio,
      location,
      experience_level,
      preferred_birds: preferred_birds ? preferred_birds.replace(/'/g, '"') : '[]',
      // We don't handle picture or bird_song uploads in this basic implementation
      // but we could extend this to handle file uploads if needed
    }))

    const { error } = await supabase
      .from('profiles')
      .upsert(profiles, {
        onConflict: 'username'
      })

    if (error) {
      return new Response(
        JSON.stringify({ error: 'Failed to import profiles', details: error }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    return new Response(
      JSON.stringify({ 
        message: 'Profiles imported successfully', 
        count: profiles.length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to process CSV file', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
