
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

    // Store original recipient for reference
    const originalTo = to

    // Store email in queue
    const { data: queuedEmail, error: queueError } = await supabaseClient
      .from('email_queue')
      .insert({
        to_email: originalTo, // Store the original recipient
        subject,
        text_content: text,
        html_content: html,
        status: 'pending'
      })
      .select()
      .single()

    if (queueError) throw queueError

    // Send email via Resend (always to accounts@thewrightsupport.com in test mode)
    console.log('Attempting to send email with the following configuration:')
    console.log({
      from: 'accounts@thewrightsupport.com',
      to: 'accounts@thewrightsupport.com', // Override recipient in test mode
      originalTo,
      subject,
      textLength: text?.length,
      htmlLength: html?.length
    })

    const testModeText = `[TEST MODE] Original recipient: ${originalTo}\n\n${text}`
    const testModeHtml = html ? 
      `<div style="background: #f0f0f0; padding: 10px; margin-bottom: 10px; border-left: 4px solid #ff9800;">
        <strong>TEST MODE</strong><br>
        Original recipient: ${originalTo}
      </div>${html}` : undefined

    const response = await resend.emails.send({
      from: 'BirdWatch Support <accounts@thewrightsupport.com>',
      to: ['accounts@thewrightsupport.com'], // Only send to verified address in test mode
      subject: `[TEST] ${subject}`,
      text: testModeText,
      html: testModeHtml,
      reply_to: 'accounts@thewrightsupport.com'
    })

    console.log('Full Resend Response:', JSON.stringify(response, null, 2))

    // Update email status in queue
    const { error: updateError } = await supabaseClient
      .from('email_queue')
      .update({ 
        status: response.error ? 'failed' : 'sent',
        sent_at: new Date().toISOString(),
        error_message: response.error ? JSON.stringify(response.error) : null
      })
      .eq('id', queuedEmail.id)

    if (updateError) throw updateError

    if (response.error) {
      throw new Error(`Resend API Error: ${JSON.stringify(response.error)}`)
    }

    console.log('Email sent successfully:', response)

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
