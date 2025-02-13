
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"

export const useBirdSearch = (searchQuery: string) => {
  return useQuery({
    queryKey: ["bird-trends", searchQuery],
    queryFn: async () => {
      if (!searchQuery) return []
      
      const { data, error } = await supabase
        .from("bird_trends")
        .select("species_name")
        .ilike('species_name', `%${searchQuery}%`)
        .order('species_name')
      
      if (error) throw error
      return data.map(trend => trend.species_name)
    }
  })
}
