
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"
import { Resend } from "npm:resend@2.0.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ChatRequest {
  conversationId: string
  userEmail: string
}

// Initialize Resend with the API key from environment variables
const resendApiKey = Deno.env.get('RESEND_API_KEY')
if (!resendApiKey) {
  console.error('RESEND_API_KEY is not set')
}
const resend = new Resend(resendApiKey)

// Use verified domain email with full access
const VERIFIED_DOMAIN_EMAIL = "autoresponse@featheredfriendtracker.co.uk"

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Received request to send conversation summary')
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { conversationId, userEmail }: ChatRequest = await req.json()
    console.log(`Processing conversation ${conversationId} for user ${userEmail}`)

    // Get chat messages and metadata
    const { data: chatData, error: chatError } = await supabaseClient
      .from('messages')
      .select(`
        content,
        created_at,
        is_system_message,
        chat_metadata!inner (
          full_name,
          description
        )
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    if (chatError) {
      console.error('Error fetching chat data:', chatError)
      throw new Error('Could not fetch chat data')
    }

    console.log(`Retrieved ${chatData.length} messages for conversation`)

    const metadata = chatData[0]?.chat_metadata
    if (!metadata) {
      throw new Error('Chat metadata not found')
    }

    // Format chat transcript
    const transcript = chatData.map(msg => `
      ${msg.is_system_message ? 'System' : metadata.full_name}: ${msg.content}
      Time: ${new Date(msg.created_at).toLocaleString()}
    `).join('\n\n')

    const htmlTranscript = chatData.map(msg => `
      <div style="margin-bottom: 20px;">
        <strong>${msg.is_system_message ? 'System' : metadata.full_name}:</strong>
        <p style="margin: 5px 0;">${msg.content}</p>
        <small style="color: #666;">Time: ${new Date(msg.created_at).toLocaleString()}</small>
      </div>
    `).join('')

    console.log('Sending email to support team')
    
    // Send email to support team
    const fromAddress = `BirdWatch Support <${VERIFIED_DOMAIN_EMAIL}>`
    
    const supportEmailResult = await resend.emails.send({
      from: fromAddress,
      to: VERIFIED_DOMAIN_EMAIL,
      subject: `New Support Chat Transcript - ${metadata.full_name}`,
      text: `
Support Chat Transcript
Reporter: ${metadata.full_name}
Email: ${userEmail}
Issue Description: ${metadata.description}

Chat Transcript:
${transcript}
      `,
      html: `
        <h2>Support Chat Transcript</h2>
        <p><strong>Reporter:</strong> ${metadata.full_name}</p>
        <p><strong>Email:</strong> ${userEmail}</p>
        <p><strong>Issue Description:</strong> ${metadata.description}</p>
        
        <h3>Chat Transcript:</h3>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 5px;">
          ${htmlTranscript}
        </div>
      `,
      reply_to: userEmail
    })
    
    console.log('Support team email result:', supportEmailResult)

    console.log('Sending confirmation to user')
    
    // Send confirmation to user
    const userEmailResult = await resend.emails.send({
      from: fromAddress,
      to: userEmail,
      subject: "BirdWatch Support - Chat Transcript",
      text: `
Dear ${metadata.full_name},

Thank you for contacting BirdWatch Support. Here's a transcript of your chat:

${transcript}

Our support team will review your message and respond if needed.

Best regards,
The BirdWatch Support Team
      `,
      html: `
        <h2>BirdWatch Support</h2>
        <p>Dear ${metadata.full_name},</p>
        <p>Thank you for contacting BirdWatch Support. Here's a transcript of your chat:</p>
        
        <div style="background: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
          ${htmlTranscript}
        </div>
        
        <p>Our support team will review your message and respond if needed.</p>
        
        <p>Best regards,<br>The BirdWatch Support Team</p>
      `,
      reply_to: VERIFIED_DOMAIN_EMAIL
    })
    
    console.log('User confirmation email result:', userEmailResult)

    return new Response(
      JSON.stringify({ 
        success: true,
        supportEmail: supportEmailResult,
        userEmail: userEmailResult
      }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in send-conversation function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        stack: error.stack
      }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
