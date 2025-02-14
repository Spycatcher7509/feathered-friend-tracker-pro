
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { google } from "googleapis"
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

const sanitizePrivateKey = (key: string): string => {
  // If the key is already in the correct format (contains proper line breaks), return it
  if (key.includes('-----BEGIN PRIVATE KEY-----') && key.includes('\n')) {
    return key;
  }

  // If the key has escaped newlines, replace them
  if (key.includes('\\n')) {
    return key.replace(/\\n/g, '\n');
  }

  // If the key is a single line, add proper formatting
  const cleanKey = key
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .trim();

  const chunks = cleanKey.match(/.{1,64}/g) || [];
  return [
    '-----BEGIN PRIVATE KEY-----',
    ...chunks,
    '-----END PRIVATE KEY-----'
  ].join('\n');
}

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

    // Get Gmail service account credentials
    const { data: credentials, error: credentialsError } = await supabaseClient
      .from('gmail_service_account')
      .select('client_email, private_key')
      .limit(1)
      .single()

    if (credentialsError || !credentials) {
      console.error('Error fetching Gmail credentials:', credentialsError)
      throw new Error('Gmail service account credentials not found')
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

    // Process the private key
    const privateKey = sanitizePrivateKey(credentials.private_key)
    
    // Log the first and last few characters of the key for debugging
    console.log('Private key preview:', {
      start: privateKey.substring(0, 32),
      end: privateKey.substring(privateKey.length - 32),
      containsHeader: privateKey.includes('-----BEGIN PRIVATE KEY-----'),
      containsFooter: privateKey.includes('-----END PRIVATE KEY-----'),
      hasLineBreaks: privateKey.includes('\n'),
      totalLength: privateKey.length
    })

    // Initialize Gmail API with fetched credentials
    const gmail = google.gmail('v1')
    const auth = new google.auth.GoogleAuth({
      credentials: {
        type: 'service_account',
        project_id: 'birdwatchingprogram',
        private_key_id: credentials.private_key_id || undefined,
        private_key: privateKey,
        client_email: credentials.client_email,
        client_id: credentials.client_id || undefined,
      },
      scopes: ['https://www.googleapis.com/auth/gmail.send']
    })

    // Create email content
    const emailContent = [
      'Content-Type: text/html; charset=utf-8',
      'MIME-Version: 1.0',
      `To: ${to}`,
      'From: BirdWatch Support <support@your-domain.com>',
      `Subject: ${subject}`,
      '',
      html || `<div>${text}</div>`
    ].join('\n')

    // Encode the email using TextEncoder and btoa
    const encoder = new TextEncoder()
    const encodedEmail = btoa(String.fromCharCode(...encoder.encode(emailContent)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')

    // Send email via Gmail API
    const response = await gmail.users.messages.send({
      auth,
      userId: 'me',
      requestBody: {
        raw: encodedEmail
      }
    })

    // Update email status in queue
    const { error: updateError } = await supabaseClient
      .from('email_queue')
      .update({ 
        status: 'sent',
        sent_at: new Date().toISOString()
      })
      .eq('id', queuedEmail.id)

    if (updateError) throw updateError

    console.log('Email sent successfully:', response.data)

    return new Response(JSON.stringify(response.data), {
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
