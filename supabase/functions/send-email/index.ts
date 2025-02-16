
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
const VERIFIED_FROM_EMAIL = Deno.env.get('resend-thewrightsupport-email') || 'noreply@thewrightsupport.com'

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
        attempted_count: 0,
        bounce_type: null,
        bounce_reason: null
      })
      .select()
      .single()

    if (queueError) throw queueError

    // Send email via Resend using verified domain
    console.log('Attempting to send email with the following configuration:', {
      from: `BirdWatch <${VERIFIED_FROM_EMAIL}>`,
      to,
      subject,
      text: text?.substring(0, 100) + '...',
      html: html ? 'HTML content provided' : 'No HTML content'
    })

    try {
      const response = await resend.emails.send({
        from: `BirdWatch <${VERIFIED_FROM_EMAIL}>`,
        to: [to],
        subject,
        text,
        html: html || undefined,
        reply_to: VERIFIED_FROM_EMAIL,
        headers: {
          'X-Entity-Ref-ID': queuedEmail.id
        }
      })

      console.log('Raw Resend API Response:', response)

      if (!response || !response.id) {
        throw new Error('Invalid response from Resend API: ' + JSON.stringify(response))
      }

      // Update email status in queue
      const { error: updateError } = await supabaseClient
        .from('email_queue')
        .update({ 
          status: 'sent',
          delivery_status: 'delivered',
          sent_at: new Date().toISOString(),
          attempted_count: 1
        })
        .eq('id', queuedEmail.id)

      if (updateError) {
        console.error('Error updating email queue:', updateError)
        throw updateError
      }

      return new Response(JSON.stringify({ 
        message: 'Email sent successfully',
        messageId: response.id 
      }), {
        headers: corsHeaders,
        status: 200,
      })

    } catch (sendError: any) {
      console.error('Resend API Error:', sendError)
      
      // Update email status to failed
      await supabaseClient
        .from('email_queue')
        .update({ 
          status: 'failed',
          delivery_status: 'failed',
          error_message: sendError.message,
          bounce_type: 'permanent',
          bounce_reason: sendError.message,
          attempted_count: 1
        })
        .eq('id', queuedEmail.id)

      throw new Error(`Resend API Error: ${sendError.message}`)
    }

  } catch (error: any) {
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
