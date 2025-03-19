
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Resend } from "npm:resend@2.0.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json'
}

const resend = new Resend(Deno.env.get("RESEND_API_KEY"))

interface EmailRequest {
  to: string
  subject: string
  text: string
  html?: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { to, subject, text, html }: EmailRequest = await req.json()
    console.log(`Sending email to ${to} with subject: ${subject}`)

    if (!to || !subject || !text) {
      throw new Error("Missing required fields: to, subject, text")
    }

    const { data, error } = await resend.emails.send({
      from: "Support <support@featheredfriendtracker.co.uk>",
      to: [to],
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
