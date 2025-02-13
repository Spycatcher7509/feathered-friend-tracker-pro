
import { supabase } from "@/integrations/supabase/client"

export const uploadAudio = async (audioBlob: Blob): Promise<string> => {
  try {
    const filename = `${crypto.randomUUID()}.webm`
    const { data, error } = await supabase.storage
      .from('bird-sounds')
      .upload(filename, audioBlob)

    if (error) throw error

    return data.path
  } catch (error) {
    console.error('Error uploading audio:', error)
    throw error
  }
}
