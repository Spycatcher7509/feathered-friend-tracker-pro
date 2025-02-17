
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ResendWebhookPayload {
  type: 'email.sent' | 'email.delivered' | 'email.delivery_delayed' | 'email.bounced' | 'email.complained'
  data: {
    email_id: string
    created_at: string
    to: string
    from: string
    subject: string
    bounce_type?: string
    bounce_code?: string
    bounce_description?: string
  }
}

// Create a Supabase client for the Edge Function
const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const payload: ResendWebhookPayload = await req.json()
    console.log('Received Resend webhook:', payload)

    // Get the active Discord webhook URL
    const { data: webhooks, error: webhooksError } = await supabaseClient
      .from('discord_webhooks')
      .select('url')
      .eq('is_active', true)
      .limit(1)

    if (webhooksError || !webhooks?.length) {
      throw new Error('No active Discord webhook found')
    }

    // Format message based on event type
    let message = ''
    const eventTime = new Date(payload.data.created_at).toLocaleString()

    switch (payload.type) {
      case 'email.sent':
        message = `📧 Email sent to ${payload.data.to} at ${eventTime}\nSubject: ${payload.data.subject}`
        break
      case 'email.delivered':
        message = `✅ Email delivered to ${payload.data.to} at ${eventTime}\nSubject: ${payload.data.subject}`
        break
      case 'email.bounced':
        message = `❌ Email bounced for ${payload.data.to} at ${eventTime}
Subject: ${payload.data.subject}
Bounce Type: ${payload.data.bounce_type}
Bounce Code: ${payload.data.bounce_code}
Description: ${payload.data.bounce_description}`
        break
      case 'email.complained':
        message = `⚠️ Spam complaint received for email to ${payload.data.to} at ${eventTime}\nSubject: ${payload.data.subject}`
        break
      case 'email.delivery_delayed':
        message = `⏳ Email delivery delayed for ${payload.data.to} at ${eventTime}\nSubject: ${payload.data.subject}`
        break
    }

    // Send to Discord
    const discordResponse = await fetch(webhooks[0].url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: message,
        username: "BirdWatch Email Bot"
      })
    })

    if (!discordResponse.ok) {
      throw new Error(`Discord API error: ${discordResponse.status}`)
    }

    // Update email status in queue if we have a matching record
    if (payload.data.email_id) {
      const { error: updateError } = await supabaseClient
        .from('email_queue')
        .update({
          delivery_status: payload.type === 'email.delivered' ? 'delivered' : 
                          payload.type === 'email.bounced' ? 'bounced' :
                          payload.type === 'email.complained' ? 'complained' :
                          payload.type === 'email.delivery_delayed' ? 'delayed' : 'sent',
          bounce_type: payload.data.bounce_type || null,
          bounce_code: payload.data.bounce_code || null,
          bounce_reason: payload.data.bounce_description || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', payload.data.email_id)

      if (updateError) {
        console.error('Error updating email status:', updateError)
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
      status: 200
    })

  } catch (error) {
    console.error('Error processing webhook:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 500 
      }
    )
  }
})
