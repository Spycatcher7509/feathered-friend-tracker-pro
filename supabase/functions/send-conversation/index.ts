
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"
import { Resend } from "npm:resend@2.0.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ConversationRequest {
  conversationId: string;
  userEmail: string;
}

const resend = new Resend(Deno.env.get('RESEND_API_KEY'))

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { conversationId, userEmail }: ConversationRequest = await req.json()

    // Get all messages from the conversation
    const { data: messages, error: messagesError } = await supabaseClient
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    if (messagesError) {
      throw new Error(`Error fetching messages: ${messagesError.message}`)
    }

    // Get conversation details
    const { data: conversation, error: conversationError } = await supabaseClient
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .single()

    if (conversationError) {
      throw new Error(`Error fetching conversation: ${conversationError.message}`)
    }

    // Format messages into HTML
    const messagesList = messages.map(msg => `
      <div style="margin-bottom: 1em; padding: 0.5em; background-color: ${msg.is_system_message ? '#f0f0f0' : '#ffffff'}">
        <div style="color: #666; font-size: 0.8em;">${new Date(msg.created_at).toLocaleString()}</div>
        <div style="margin-top: 0.5em;">${msg.content}</div>
      </div>
    `).join('')

    const html = `
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 2em;">
          <h1 style="color: #333;">Conversation Summary</h1>
          <p style="color: #666;">Conversation started: ${new Date(conversation.created_at).toLocaleString()}</p>
          <div style="margin-top: 2em;">
            ${messagesList}
          </div>
        </body>
      </html>
    `

    // Send email via Resend
    const emailResponse = await resend.emails.send({
      from: 'BirdWatch <accounts@thewrightsupport.com>',
      to: [userEmail],
      subject: `Conversation Summary - ${conversation.title || 'Chat'}`,
      html: html,
      text: messages.map(msg => `${new Date(msg.created_at).toLocaleString()}\n${msg.content}\n\n`).join('')
    })

    console.log('Email sent successfully:', emailResponse)

    // Update conversation status to closed
    const { error: updateError } = await supabaseClient
      .from('conversations')
      .update({ status: 'closed' })
      .eq('id', conversationId)

    if (updateError) {
      console.error('Error updating conversation status:', updateError)
    }

    return new Response(
      JSON.stringify({ success: true, emailId: emailResponse.data?.id }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    )

  } catch (error) {
    console.error('Error in send-conversation function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 500 
      }
    )
  }
})
