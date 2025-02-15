
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

const formatPrivateKey = (rawKey: string): string => {
  try {
    // First, normalize line endings and remove any extra whitespace
    let normalized = rawKey
      .replace(/\\n/g, '\n')
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .trim();

    // If the key already has proper headers, just ensure line breaks are correct
    if (normalized.includes('-----BEGIN PRIVATE KEY-----') && 
        normalized.includes('-----END PRIVATE KEY-----')) {
      normalized = normalized
        .replace('-----BEGIN PRIVATE KEY-----', '')
        .replace('-----END PRIVATE KEY-----', '')
        .replace(/\s+/g, '');
    }

    // Remove any existing headers/footers and all whitespace
    const cleanKey = normalized.replace(/-----(BEGIN|END) PRIVATE KEY-----/g, '').replace(/\s+/g, '');

    // Split the key into 64-character chunks
    const chunks = cleanKey.match(/.{1,64}/g) || [];

    // Reconstruct the key with proper PEM formatting
    return [
      '-----BEGIN PRIVATE KEY-----',
      ...chunks,
      '-----END PRIVATE KEY-----'
    ].join('\n');
  } catch (error) {
    console.error('Error formatting private key:', error);
    throw new Error('Failed to format private key: ' + error.message);
  }
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

    // Get Gmail service account credentials
    const { data: credentials, error: credentialsError } = await supabaseClient
      .from('gmail_service_account')
      .select('*')
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

    // Format and validate the private key
    const formattedKey = formatPrivateKey(credentials.private_key);
    
    // Debug log the key structure (without exposing the actual key)
    console.log('Private key validation:', {
      hasHeader: formattedKey.startsWith('-----BEGIN PRIVATE KEY-----'),
      hasFooter: formattedKey.endsWith('-----END PRIVATE KEY-----'),
      totalLength: formattedKey.length,
      lineCount: formattedKey.split('\n').length,
      firstChunkLength: formattedKey.split('\n')[1]?.length || 0
    });

    // Initialize Gmail API
    const gmail = google.gmail('v1')
    
    const auth = new google.auth.GoogleAuth({
      credentials: {
        type: 'service_account',
        project_id: credentials.project_id,
        private_key_id: credentials.private_key_id,
        private_key: formattedKey,
        client_email: credentials.client_email,
        client_id: credentials.client_id,
        auth_uri: 'https://accounts.google.com/o/oauth2/auth',
        token_uri: 'https://oauth2.googleapis.com/token',
        auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
        client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(credentials.client_email)}`
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

    // Encode the email
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
