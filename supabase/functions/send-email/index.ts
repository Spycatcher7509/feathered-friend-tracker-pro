
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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
  isTicket?: boolean
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY")
    
    if (!resendApiKey) {
      console.log('No Resend API key found. Email functionality is disabled.')
      return new Response(
        JSON.stringify({ 
          error: "Email functionality is currently disabled. Please contact the administrator to configure the email service.",
          emailDisabled: true
        }),
        { headers: corsHeaders, status: 503 }
      )
    }
    
    // Only import and initialize Resend if we have an API key
    // This helps prevent unnecessary errors in the function logs
    const { Resend } = await import("npm:resend@2.0.0")
    const resend = new Resend(resendApiKey)
    
    const { to, subject, text, html, isTicket = false }: EmailRequest = await req.json()
    
    // If it's a ticket, override the "to" address regardless of what was passed
    const finalTo = isTicket ? "accounts@thewrightsupport" : to
    
    console.log(`Sending ${isTicket ? 'ticket' : 'email'} to ${finalTo} with subject: ${subject}`)

    if (!finalTo || !subject || !text) {
      throw new Error("Missing required fields: to, subject, text")
    }

    const { data, error } = await resend.emails.send({
      from: "Support <support@featheredfriendtracker.co.uk>",
      to: [finalTo],
      subject: subject,
      text: text,
      html: html || text
    })

    if (error) {
      console.error('Resend API Error:', error)
      return new Response(
        JSON.stringify({ error: error.message }),
        { headers: corsHeaders, status: 400 }
      )
    }

    console.log('Resend API Success Response:', data)
    return new Response(
      JSON.stringify({ data }),
      { headers: corsHeaders, status: 200 }
    )

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
