
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { BirdSpecies } from "../types/bird-species"

export function useBirdSpecies(searchQuery: string) {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: birdSpecies, isLoading, error } = useQuery({
    queryKey: ["bird-species", searchQuery],
    queryFn: async () => {
      console.log("Searching for:", searchQuery)
      const query = supabase
        .from("bird_species")
        .select("*")
        
      if (searchQuery) {
        query.or(`name.ilike.%${searchQuery.toLowerCase()}%,scientific_name.ilike.%${searchQuery.toLowerCase()}%`)
      }
      
      const { data, error } = await query.order("name")

      if (error) {
        console.error("Supabase error:", error)
        throw error
      }
      
      console.log("Search results:", data)
      return data as BirdSpecies[]
    }
  })

  const handleDelete = async (speciesId: string) => {
    try {
      const { error } = await supabase
        .from('bird_species')
        .delete()
        .eq('id', speciesId)

      if (error) {
        throw error
      }

      toast({
        title: "Success",
        description: "Bird species deleted successfully",
      })

      // Refresh the bird species list
      queryClient.invalidateQueries({ queryKey: ["bird-species"] })
    } catch (error) {
      console.error("Error deleting bird species:", error)
      toast({
        title: "Error",
        description: "Failed to delete bird species. You can only delete species you've recorded.",
        variant: "destructive",
      })
    }
  }

  if (error) {
    toast({
      title: "Error",
      description: "Failed to load bird species",
      variant: "destructive",
    })
  }

  return {
    birdSpecies,
    isLoading,
    error,
    handleDelete
  }
}
