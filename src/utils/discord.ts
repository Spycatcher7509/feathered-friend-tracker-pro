
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

export const sendDiscordWebhookMessage = async (message: string, webhookDescription?: string) => {
  const { data: webhooks, error: webhooksError } = await supabase
    .from('discord_webhooks')
    .select('url, description')
    .eq('is_active', true)
  
  if (webhooksError) {
    console.error('Error fetching webhooks:', webhooksError)
    throw new Error('Failed to fetch Discord webhooks')
  }
  
  if (!webhooks || webhooks.length === 0) {
    console.log("No active webhooks found")
    throw new Error('No active Discord webhooks found')
  }

  console.log(`Found ${webhooks.length} active webhooks:`, webhooks)
  
  const webhook = webhookDescription 
    ? webhooks.find(w => w.description === webhookDescription) 
    : webhooks[0]
  
  if (!webhook) {
    throw new Error(`Webhook ${webhookDescription || 'default'} not found`)
  }
  
  console.log(`Attempting to send to webhook: ${webhook.description || 'Unnamed webhook'}`)
  
  const response = await fetch(webhook.url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content: message,
      username: "BirdWatch Backup Bot"
    })
  })

  console.log('Discord API response:', response.status)

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  
  console.log(`Successfully sent notification to webhook: ${webhook.description || 'Unnamed webhook'}`)
}

