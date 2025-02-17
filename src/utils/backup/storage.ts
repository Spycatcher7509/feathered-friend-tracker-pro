
import { supabase } from "@/integrations/supabase/client"

export const downloadAndUploadToStorage = async (url: string, filename: string): Promise<string> => {
  try {
    // If URL is already in our storage, return it as is
    if (url.includes('supabase.co')) {
      return url
    }

    // For external URLs, create a direct reference in our storage
    const { data, error } = await supabase
      .from('external_bird_sounds')
      .update({ sound_url: url })
      .eq('sound_url', url)
      .select('id, bird_name, sound_url, source')
      .single()

    if (error) {
      console.error('Error updating sound URL:', error)
      return url
    }

    return url
  } catch (error) {
    console.error('Error processing sound file:', error)
    return url
  }
}
