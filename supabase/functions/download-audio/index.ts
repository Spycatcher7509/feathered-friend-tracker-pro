
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { audioUrl } = await req.json()
    
    if (!audioUrl) {
      return new Response(
        JSON.stringify({ error: 'No audio URL provided' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    console.log('Attempting to fetch audio from URL:', audioUrl)

    // Fetch the audio file with custom headers
    const response = await fetch(audioUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'audio/*, */*',
        'Origin': 'https://xeno-canto.org'
      }
    })

    if (!response.ok) {
      console.error('Failed to fetch audio:', response.status, response.statusText)
      throw new Error(`Failed to fetch audio: ${response.statusText}`)
    }

    const audioData = await response.arrayBuffer()
    console.log('Successfully downloaded audio data, size:', audioData.byteLength)

    const contentType = response.headers.get('content-type') || 'audio/mpeg'

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Generate a unique filename
    const filename = `${crypto.randomUUID()}.mp3`
    console.log('Uploading to Supabase storage as:', filename)

    // Upload to Supabase storage
    const { data, error: uploadError } = await supabase.storage
      .from('bird-sounds')
      .upload(filename, audioData, {
        contentType,
        upsert: true
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      throw uploadError
    }

    console.log('Successfully uploaded to storage:', data)

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('bird-sounds')
      .getPublicUrl(filename)

    console.log('Generated public URL:', publicUrl)

    return new Response(
      JSON.stringify({ url: publicUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error('Error in download-audio function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
