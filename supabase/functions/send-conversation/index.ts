
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

const resend = new Resend(Deno.env.get('RESEND_API_KEY'))

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { conversationId, userEmail }: ChatRequest = await req.json()

    // Get support team email
    const { data: supportConfig, error: supportConfigError } = await supabaseClient
      .from('support_team_config')
      .select('support_email')
      .single()

    if (supportConfigError) {
      console.error('Error fetching support team config:', supportConfigError)
      throw new Error('Could not fetch support team configuration')
    }

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

    // Send email to support team
    await resend.emails.send({
      from: "BirdWatch Support <accounts@thewrightsupport.com>",
      to: supportConfig.support_email,
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

    // Send confirmation to user
    await resend.emails.send({
      from: "BirdWatch Support <accounts@thewrightsupport.com>",
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
      reply_to: "accounts@thewrightsupport.com"
    })

    return new Response(
      JSON.stringify({ success: true }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in send-conversation function:', error)
    return new Response(
      JSON.stringify({ error: error.message }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
