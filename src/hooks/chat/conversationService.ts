
import { supabase } from "@/integrations/supabase/client"
import { ChatFormData } from "./types"

/**
 * Creates a new conversation in the database
 */
export const createConversation = async (userId: string) => {
  const { data: newConv, error: convError } = await supabase
    .from('conversations')
    .insert({
      user_id: userId,
      status: 'active'
    })
    .select()
    .single()

  if (convError) {
    console.error('Error creating conversation:', convError)
    throw convError
  }
  
  return newConv
}

/**
 * Stores conversation metadata in the database
 */
export const storeConversationMetadata = async (
  conversationId: string, 
  metadata: ChatFormData
) => {
  const { error: metadataError } = await supabase
    .from('chat_metadata')
    .insert({
      conversation_id: conversationId,
      full_name: metadata.fullName,
      email: metadata.email,
      description: metadata.description,
      attachments: []
    })

  if (metadataError) {
    console.error('Error storing metadata:', metadataError)
    throw metadataError
  }
}

/**
 * Uploads file attachments for a conversation
 */
export const uploadAttachments = async (
  conversationId: string, 
  attachments: File[]
) => {
  const uploadPromises = attachments.map(async (file) => {
    const filename = `${conversationId}/${file.name}`
    const { error: uploadError } = await supabase.storage
      .from('chat-attachments')
      .upload(filename, file)
    
    if (uploadError) {
      console.error('Error uploading file:', uploadError)
      throw uploadError
    }
    return filename
  })

  try {
    return await Promise.all(uploadPromises)
  } catch (uploadError) {
    console.error('Error processing uploads:', uploadError)
    throw uploadError
  }
}

/**
 * Updates conversation attachments in metadata
 */
export const updateConversationAttachments = async (
  conversationId: string, 
  attachments: string[]
) => {
  await supabase
    .from('chat_metadata')
    .update({ attachments })
    .eq('conversation_id', conversationId)
}

/**
 * Sends a system message in a conversation
 */
export const sendSystemMessage = async (
  conversationId: string, 
  content: string,
  userId: string
) => {
  const { error } = await supabase
    .from('messages')
    .insert({
      content,
      conversation_id: conversationId,
      is_system_message: true,
      user_id: userId
    })

  if (error) {
    console.error('Error sending system message:', error)
    throw error
  }
}

/**
 * Closes a conversation by updating its status
 */
export const closeConversation = async (conversationId: string) => {
  const { error: statusError } = await supabase
    .from('conversations')
    .update({ status: 'closed' })
    .eq('id', conversationId)
  
  if (statusError) {
    console.error('Error closing conversation:', statusError)
    throw statusError
  }
}

/**
 * Sends a conversation summary via edge function
 */
export const sendConversationSummary = async (
  conversationId: string, 
  userEmail: string
) => {
  const { error } = await supabase.functions.invoke('send-conversation', {
    body: {
      conversationId,
      userEmail
    }
  })

  if (error) {
    console.error('Error sending conversation summary:', error)
    throw error
  }
}
