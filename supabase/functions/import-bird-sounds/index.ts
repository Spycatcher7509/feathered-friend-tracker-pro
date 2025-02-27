
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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // First, ensure the bird-sounds bucket exists
    const { data: bucketData, error: bucketError } = await supabase
      .storage.createBucket('bird-sounds', {
        public: true,
        allowedMimeTypes: ['audio/mpeg', 'audio/mp3']
      })

    if (bucketError && bucketError.message !== 'Bucket already exists') {
      throw bucketError
    }

    // Upload the Blue Jay sound file
    const audioFile = await Deno.readFile('./XC940085 - Blue Jay - Cyanocitta cristata.mp3')
    const filename = 'blue-jay.mp3'

    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('bird-sounds')
      .upload(filename, audioFile, {
        contentType: 'audio/mpeg',
        upsert: true
      })

    if (uploadError) {
      throw uploadError
    }

    // Get the public URL for the uploaded file
    const { data: { publicUrl } } = supabase
      .storage
      .from('bird-sounds')
      .getPublicUrl(filename)

    // Insert or update the sound in the external_bird_sounds table
    const { data: insertData, error: insertError } = await supabase
      .from('external_bird_sounds')
      .upsert({
        bird_name: 'Blue Jay',
        sound_url: publicUrl,
        source: 'AllAboutBirds'
      })

    if (insertError) {
      throw insertError
    }

    return new Response(
      JSON.stringify({ 
        message: 'Blue Jay sound added successfully',
        url: publicUrl
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }, 
        status: 500 
      }
    )
  }
})
