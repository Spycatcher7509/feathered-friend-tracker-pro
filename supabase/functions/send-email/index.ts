
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"
import { Resend } from "npm:resend@2.0.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
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

const resend = new Resend(Deno.env.get('RESEND_API_KEY'))

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
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

    // Store email in queue with initial status
    const { data: queuedEmail, error: queueError } = await supabaseClient
      .from('email_queue')
      .insert({
        to_email: to,
        subject,
        text_content: text,
        html_content: html,
        status: 'pending',
        delivery_status: 'pending',
        attempted_count: 0
      })
      .select()
      .single()

    if (queueError) throw queueError

    // Send email via Resend using testing domain
    console.log('Attempting to send email with the following configuration:', {
      from: 'BirdWatch <onboarding@resend.dev>',
      to,
      subject,
      text: text?.substring(0, 100) + '...',
      html: html ? 'HTML content provided' : 'No HTML content'
    })

    const response = await resend.emails.send({
      from: 'BirdWatch <onboarding@resend.dev>',
      to: [to],
      subject,
      text,
      html: html || undefined,
      reply_to: 'onboarding@resend.dev',
      headers: {
        'X-Entity-Ref-ID': queuedEmail.id
      }
    })

    console.log('Resend API Response:', JSON.stringify(response, null, 2))

    // Update email status in queue with more detailed information
    const { error: updateError } = await supabaseClient
      .from('email_queue')
      .update({ 
        status: response.error ? 'failed' : 'sent',
        delivery_status: response.error ? 'failed' : 'delivered',
        sent_at: new Date().toISOString(),
        error_message: response.error ? JSON.stringify(response.error) : null,
        bounce_info: response.error ? { error: response.error } : null,
        attempted_count: 1
      })
      .eq('id', queuedEmail.id)

    if (updateError) {
      console.error('Error updating email queue:', updateError)
      throw updateError
    }

    if (response.error) {
      console.error('Resend API Error:', response.error)
      throw new Error(`Failed to send email: ${JSON.stringify(response.error)}`)
    }

    console.log('Email sent successfully:', {
      id: response.id,
      to,
      subject
    })

    return new Response(JSON.stringify({ 
      message: 'Email sent successfully',
      messageId: response.id 
    }), {
      headers: corsHeaders,
      status: 200,
    })
  } catch (error) {
    console.error('Detailed error in send-email function:', {
      message: error.message,
      stack: error.stack,
      cause: error.cause
    })
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error instanceof Error ? error.stack : undefined
      }),
      { 
        headers: corsHeaders,
        status: 500,
      }
    )
  }
})
