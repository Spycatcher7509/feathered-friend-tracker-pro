
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ChatRequest {
  conversationId: string
  userEmail: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
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
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 503 }
      )
    }

    const { conversationId, userEmail }: ChatRequest = await req.json()
    console.log(`Preparing to send conversation summary for ${conversationId} to ${userEmail}`)
    
    if (!conversationId || !userEmail) {
      throw new Error("Missing required fields: conversationId, userEmail")
    }

    // Initialize Supabase client with service role to bypass RLS
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    )

    // Fetch the messages for the conversation
    const { data: messages, error: messagesError } = await supabaseClient
      .from('messages')
      .select(`
        content,
        created_at,
        is_system_message,
        user_id,
        profiles(email)
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    if (messagesError) {
      throw new Error(`Error fetching messages: ${messagesError.message}`)
    }

    // Fetch the metadata for the conversation
    const { data: metadata, error: metadataError } = await supabaseClient
      .from('chat_metadata')
      .select('*')
      .eq('conversation_id', conversationId)
      .single()

    if (metadataError && metadataError.code !== 'PGRST116') {
      throw new Error(`Error fetching metadata: ${metadataError.message}`)
    }

    // Format the conversation as HTML
    let messagesList = ''
    messages.forEach((message) => {
      const sender = message.is_system_message ? 'System' : 
                    (message.profiles?.email || 'Support Agent')
      messagesList += `
        <div style="margin-bottom: 12px; border-bottom: 1px solid #eee; padding-bottom: 12px;">
          <p style="margin: 0; color: #666; font-size: 14px;"><strong>${sender}</strong> - ${new Date(message.created_at).toLocaleString()}</p>
          <p style="margin-top: 4px;">${message.content}</p>
        </div>
      `
    })

    // Only import and initialize Resend if we have an API key
    const { Resend } = await import("npm:resend@2.0.0")
    const resend = new Resend(resendApiKey)
    
    // Send email with conversation summary
    const { data, error } = await resend.emails.send({
      from: "Support <support@featheredfriendtracker.co.uk>",
      to: [userEmail],
      subject: "Your BirdWatch Support Conversation Summary",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #223534;">BirdWatch Support Conversation Summary</h2>
          <p>Dear User,</p>
          <p>Below is a summary of your recent conversation with our support team:</p>
          
          <div style="margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px;">
            ${messagesList}
          </div>
          
          <p>Thank you for contacting BirdWatch Support. If you have any further questions, please don't hesitate to reach out to us again.</p>
          <p>Best regards,<br>The BirdWatch Support Team</p>
        </div>
      `
    })

    if (error) {
      console.error('Resend API Error:', error)
      return new Response(
        JSON.stringify({ error: error.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    console.log('Email sent successfully:', data)
    return new Response(
      JSON.stringify({ success: true, data }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
