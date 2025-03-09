
import { useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { EditingState } from "../types"

export function useUserEditing(onSuccess: () => void) {
  const [editing, setEditing] = useState<EditingState>({ id: null, field: null, value: "" })
  const { toast } = useToast()

  const startEditing = (id: string, field: EditingState['field'], currentValue: string) => {
    setEditing({ id, field, value: currentValue || '' })
  }

  const cancelEditing = () => {
    setEditing({ id: null, field: null, value: "" })
  }

  const saveEdit = async () => {
    if (!editing.id || !editing.field) return

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ [editing.field]: editing.value })
        .eq('id', editing.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "User details updated successfully",
      })
      
      onSuccess()
      cancelEditing()
    } catch (error) {
      console.error('Error updating user:', error)
      toast({
        title: "Error",
        description: "Failed to update user details",
        variant: "destructive",
      })
    }
  }

  return {
    editing,
    startEditing,
    cancelEditing,
    saveEdit,
    setEditingValue: (value: string) => setEditing(prev => ({ ...prev, value }))
  }
}
