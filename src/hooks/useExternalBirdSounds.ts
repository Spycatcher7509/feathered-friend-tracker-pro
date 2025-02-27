
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"

interface ExternalBirdSound {
  id: string
  bird_name: string
  sound_url: string
  source: string
}

export const useExternalBirdSounds = () => {
  return useQuery({
    queryKey: ["externalBirdSounds"],
    queryFn: async () => {
      console.log("Fetching external bird sounds...")
      const { data, error } = await supabase
        .from("external_bird_sounds")
        .select("*")
        .order("bird_name")

      if (error) {
        console.error("Error fetching bird sounds:", error)
        throw error
      }
      
      console.log("Fetched bird sounds:", data)
      return data as ExternalBirdSound[]
    }
  })
}

export type { ExternalBirdSound }
