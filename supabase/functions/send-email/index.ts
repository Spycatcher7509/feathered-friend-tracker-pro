
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"
import { Resend } from "npm:resend@2.0.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

// Initialize Resend with the API key
const resendApiKey = Deno.env.get('RESEND_API_KEY')
if (!resendApiKey) {
  console.error('RESEND_API_KEY is not set')
}
const resend = new Resend(resendApiKey)

// Use verified domain email from featheredfriendtracker.co.uk
const VERIFIED_DOMAIN_EMAIL = "support@featheredfriendtracker.co.uk"

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const requestData = await req.json()
    console.log('Received request data:', JSON.stringify(requestData))

    const { to, subject, text, html } = requestData as EmailRequest
    
    if (!to || !subject || !text) {
      console.error('Missing required fields:', { to, subject, text })
      throw new Error('Missing required fields: to, subject, and text are required')
    }

    // Validate email format
    if (!to.includes('@')) {
      console.error('Invalid email format:', to)
      throw new Error('Invalid email format')
    }

    // Check daily email count
    const { data: { count }, error: countError } = await supabaseClient.rpc('get_daily_email_count')
    if (countError) {
      console.error('Error checking email count:', countError)
      throw countError
    }
    
    console.log('Daily email count:', count)
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

    if (queueError) {
      console.error('Error queuing email:', queueError)
      throw queueError
    }

    // Prepare sender information
    const fromAddress = `BirdWatch Support <${VERIFIED_DOMAIN_EMAIL}>`
    
    // Important: Check if this is a support email
    const isToSupportTeam = to === 'accounts@thewrightsupport.com' || 
                           to === 'support@featheredfriendtracker.co.uk';
    
    // Always use the verified domain email for support team emails
    // For regular users, send to their actual email address
    const correctedTo = isToSupportTeam ? VERIFIED_DOMAIN_EMAIL : to;
    
    console.log('Attempting to send email with the following configuration:', {
      from: fromAddress,
      to: correctedTo,
      subject,
      text: text?.substring(0, 100) + '...',
      html: html ? 'HTML content provided' : 'No HTML content'
    })

    try {
      // Send email via Resend API
      const response = await resend.emails.send({
        from: fromAddress,
        to: [correctedTo],
        subject,
        text,
        html: html || undefined,
        reply_to: VERIFIED_DOMAIN_EMAIL
      });

      console.log('Raw Resend API Response:', JSON.stringify(response))

      // Check for errors in the response
      if (response.error) {
        throw new Error(`Resend API Error: ${response.error.message || JSON.stringify(response.error)}`)
      }

      // Updated validation to check response.data.id instead of response.id
      if (!response?.data?.id) {
        throw new Error('Invalid response from Resend API: ' + JSON.stringify(response))
      }

      // Update email status in queue to indicate successful delivery
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

      console.log('Email sent successfully with message ID:', response.data.id)
      
      return new Response(JSON.stringify({ 
        message: 'Email sent successfully',
        messageId: response.data.id 
      }), {
        headers: corsHeaders,
        status: 200,
      })

    } catch (sendError) {
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
