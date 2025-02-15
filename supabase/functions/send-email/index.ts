
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailRequest {
  to: string
  subject: string
  text: string
  html?: string
}

// Create a Supabase client for the Edge Function
const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const requestData = await req.json()
    console.log('Received request data:', requestData)

    const { to, subject, text, html } = requestData as EmailRequest
    
    if (!to || !subject || !text) {
      console.error('Missing required fields:', { to, subject, text })
      throw new Error('Missing required fields')
    }

    // Validate email format
    if (!to.includes('@')) {
      console.error('Invalid email format:', to)
      throw new Error('Invalid email format')
    }

    // Check daily email count
    const { data: { count }, error: countError } = await supabaseClient.rpc('get_daily_email_count')
    if (countError) throw countError
    
    if (count >= 2000) {
      throw new Error('Daily email limit reached (2000 emails/day)')
    }

    // Store email in queue
    const { data: queuedEmail, error: queueError } = await supabaseClient
      .from('email_queue')
      .insert({
        to_email: to,
        subject,
        text_content: text,
        html_content: html,
        status: 'pending'
      })
      .select()
      .single()

    if (queueError) throw queueError

    const MAILGUN_API_KEY = Deno.env.get('MAILGUN_API_KEY')
    if (!MAILGUN_API_KEY) {
      throw new Error('Mailgun API key not found')
    }

    // Prepare email data for Mailgun
    const formData = new FormData()
    formData.append('from', 'BirdWatch Support <postmaster@sandbox701608d79c824197ae3fabb7236e81ae.mailgun.org>')
    formData.append('to', to)
    formData.append('subject', subject)
    formData.append('text', text)
    if (html) {
      formData.append('html', html)
    }

    // Send email via Mailgun API with proper authentication
    const response = await fetch(
      'https://api.mailgun.net/v3/sandbox701608d79c824197ae3fabb7236e81ae.mailgun.org/messages',
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`api:${MAILGUN_API_KEY}`)}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      }
    )

    // Get the response text first
    const responseText = await response.text()
    console.log('Raw Mailgun response:', responseText)

    if (!response.ok) {
      console.error('Mailgun API error:', {
        status: response.status,
        statusText: response.statusText,
        response: responseText
      })
      throw new Error(`Mailgun API error: ${response.statusText}`)
    }

    let responseData
    try {
      responseData = JSON.parse(responseText)
    } catch (e) {
      console.warn('Could not parse Mailgun response as JSON:', responseText)
      responseData = { message: 'Email sent but response was not JSON' }
    }

    // Update email status in queue
    const { error: updateError } = await supabaseClient
      .from('email_queue')
      .update({ 
        status: 'sent',
        sent_at: new Date().toISOString()
      })
      .eq('id', queuedEmail.id)

    if (updateError) throw updateError

    console.log('Email sent successfully:', responseData)

    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Error in send-email function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error instanceof Error ? error.stack : undefined
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
