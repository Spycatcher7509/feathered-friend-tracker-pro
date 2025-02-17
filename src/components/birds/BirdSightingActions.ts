
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

export const useBirdSightingActions = (refetch: () => void) => {
  const { toast } = useToast()

  const handleImageUpload = async (sightingId: string, file: File) => {
    try {
      const fileExt = file.name.split('.').pop()
      const isVideo = file.type.startsWith('video/')
      const bucket = isVideo ? 'bird-videos' : 'bird-images'
      const filePath = `${crypto.randomUUID()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath)

      const { error: updateError } = await supabase
        .from('bird_sightings')
        .update({ 
          media_url: publicUrl,
          media_type: file.type,
          image_url: !isVideo ? publicUrl : null // Update image_url only for images
        })
        .eq('id', sightingId)

      if (updateError) throw updateError

      toast({
        title: "Success",
        description: `${isVideo ? 'Video' : 'Image'} uploaded successfully`,
      })

      refetch()
    } catch (error) {
      console.error('Error uploading media:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to upload media. Please try again.",
      })
    }
  }

  const handleDelete = async (sightingId: string) => {
    try {
      const { error } = await supabase
        .from('bird_sightings')
        .delete()
        .eq('id', sightingId)

      if (error) throw error

      toast({
        title: "Success",
        description: "Bird sighting deleted successfully",
      })

      refetch()
    } catch (error) {
      console.error('Error deleting sighting:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete sighting. Please try again.",
      })
    }
  }

  return {
    handleImageUpload,
    handleDelete
  }
}
