
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing environment variables')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Create backup data
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
    if (profilesError) throw profilesError

    const { data: birdSounds, error: birdSoundsError } = await supabase
      .from('external_bird_sounds')
      .select('*')
    if (birdSoundsError) throw birdSoundsError

    // Calculate tokens and cost (example rates)
    const tokensPerRecord = 100 // Estimate tokens per record
    const costPerToken = 0.0001 // Example cost per token in USD
    const totalTokens = (profiles.length + birdSounds.length) * tokensPerRecord
    const totalCost = totalTokens * costPerToken

    // Insert backup record with cost tracking
    const { data: backup, error: backupError } = await supabase
      .from('backups')
      .insert({
        filename: `scheduled_backup_${new Date().toISOString()}.json`,
        total_tokens: totalTokens,
        total_cost: totalCost,
        size_bytes: JSON.stringify({ profiles, birdSounds }).length
      })
      .select()
      .single()

    if (backupError) throw backupError

    return new Response(JSON.stringify({ success: true, backup }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error in create-backup function:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
