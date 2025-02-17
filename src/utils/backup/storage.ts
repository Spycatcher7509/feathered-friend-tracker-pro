
import { supabase } from "@/integrations/supabase/client"

export const downloadAndUploadToStorage = async (url: string, filename: string): Promise<string> => {
  try {
    // If URL is already in our storage, return it as is
    if (url.includes('supabase.co')) {
      return url
    }

    // For external URLs, just return the URL as is since we can't access it
    return url
  } catch (error) {
    console.error('Error processing sound file:', error)
    return url
  }
}
