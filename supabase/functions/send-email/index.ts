
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const GMAIL_API_KEY = Deno.env.get('GMAIL_API_KEY')

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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    if (!GMAIL_API_KEY) {
      console.error('GMAIL_API_KEY is not configured')
      throw new Error('GMAIL_API_KEY is not configured')
    }

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

    console.log('Processing email request:', { to, subject })

    // Create email content in base64 format
    const email = {
      raw: btoa(`
From: BirdWatch Support <support@thewrightsupport.com>
To: ${to}
Subject: ${subject}
Content-Type: ${html ? 'text/html' : 'text/plain'}

${html || text}
      `).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
    }

    console.log('Sending email with data:', { to, subject })

    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GMAIL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(email),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Gmail API error response:', response.status, errorText)
      throw new Error(`Gmail API error: ${errorText}`)
    }

    const responseData = await response.json()
    console.log('Gmail API success response:', responseData)

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

