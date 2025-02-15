
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"
import { SESv2Client, SendEmailCommand } from "https://esm.sh/@aws-sdk/client-sesv2"

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

// Initialize SES client
const sesClient = new SESv2Client({
  region: Deno.env.get('AWS_REGION') ?? 'eu-north-1',
  credentials: {
    accessKeyId: Deno.env.get('AWS_ACCESS_KEY_ID') ?? '',
    secretAccessKey: Deno.env.get('AWS_SECRET_ACCESS_KEY') ?? ''
  }
})

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

    // Prepare the email sending command
    const sendEmailCommand = new SendEmailCommand({
      FromEmailAddress: 'accounts@thewrightsupport.com',
      Destination: {
        ToAddresses: [to],
      },
      Content: {
        Simple: {
          Subject: {
            Data: subject,
            Charset: 'UTF-8'
          },
          Body: {
            Text: {
              Data: text,
              Charset: 'UTF-8'
            },
            ...(html && {
              Html: {
                Data: html,
                Charset: 'UTF-8'
              }
            })
          }
        }
      }
    })

    // Send email via AWS SES
    console.log('Sending email via AWS SES...')
    const response = await sesClient.send(sendEmailCommand)
    console.log('SES Response:', response)

    // Update email status in queue
    const { error: updateError } = await supabaseClient
      .from('email_queue')
      .update({ 
        status: 'sent',
        sent_at: new Date().toISOString()
      })
      .eq('id', queuedEmail.id)

    if (updateError) throw updateError

    console.log('Email sent successfully:', response)

    return new Response(JSON.stringify({ 
      message: 'Email sent successfully',
      messageId: response.MessageId 
    }), {
      headers: corsHeaders,
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
        headers: corsHeaders,
        status: 500,
      }
    )
  }
})
