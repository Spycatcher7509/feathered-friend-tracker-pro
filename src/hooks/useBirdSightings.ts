
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"

interface BirdSighting {
  id: string
  bird_name: string
  location: string
  created_at: string
  image_url: string | null
  description: string | null
  sound_url: string | null
  user_id: string
  bird_species?: {
    name: string
    scientific_name: string
  }
  isPersonal: boolean
  scientificName: string | undefined
}

export const useBirdSightings = (
  showGlobal: boolean, 
  searchQuery: string,
  trendSpecies: string[] | undefined
) => {
  return useQuery({
    queryKey: ["bird-sightings", showGlobal, searchQuery, trendSpecies],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      let query = supabase
        .from("bird_sightings")
        .select(`
          *,
          bird_species (
            name,
            scientific_name
          )
        `)
        .order("created_at", { ascending: false })

      if (!showGlobal) {
        query = query.eq("user_id", user?.id)
      }

      if (searchQuery) {
        const searchConditions = [`bird_name.ilike.%${searchQuery}%`]
        
        // Add trend species to search if available
        if (trendSpecies?.length) {
          searchConditions.push(`bird_name.in.(${trendSpecies.map(name => `'${name}'`).join(',')})`)
        }
        
        query = query.or(searchConditions.join(','))
      }
      
      const { data, error } = await query
      
      if (error) throw error
      
      return data.map(sighting => ({
        ...sighting,
        isPersonal: sighting.user_id === user?.id,
        scientificName: sighting.bird_species?.scientific_name
      }))
    },
    enabled: true // Remove the dependency on trendSpecies
  })
}

export type { BirdSighting }
