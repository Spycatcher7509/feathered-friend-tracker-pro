import { supabase } from "@/integrations/supabase/client"

export const uploadUserGuide = async () => {
  const response = await fetch('/BirdWatch-User-Guide.pdf')
  const blob = await response.blob()
  
  const { error } = await supabase.storage
    .from('user-guides')
    .upload('birdwatch-guide.pdf', blob, {
      contentType: 'application/pdf',
      upsert: true
    })

  if (error) {
    console.error('Error uploading user guide:', error)
    throw error
  }
}