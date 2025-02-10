
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { User } from '@supabase/supabase-js'

export const useAdminGroups = () => {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const addUserToAdminGroup = async (userEmail: string) => {
    try {
      setIsLoading(true)

      // First, get the admin group ID
      const { data: adminGroups, error: groupError } = await supabase
        .from('admin_groups')
        .select('id')
        .eq('name', 'System Administrators')
        .single()

      if (groupError) {
        throw new Error('Failed to fetch admin group')
      }

      // Get the user by email
      const { data: { users }, error: userError } = await supabase.auth.admin
        .listUsers()

      if (userError) {
        throw new Error('Failed to fetch user')
      }

      const user = (users as User[]).find(u => u.email === userEmail)
      if (!user) {
        throw new Error('User not found')
      }

      // Add user to admin group
      const { error: memberError } = await supabase
        .from('admin_group_members')
        .insert({
          group_id: adminGroups.id,
          user_id: user.id
        })

      if (memberError) {
        throw new Error('Failed to add user to admin group')
      }

      // Update the user's profile to mark them as admin
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ is_admin: true })
        .eq('id', user.id)

      if (profileError) {
        throw new Error('Failed to update user profile')
      }

      toast({
        title: "Success",
        description: `Added ${userEmail} to admin group`,
      })
    } catch (error) {
      console.error('Error adding user to admin group:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to add user to admin group',
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const checkAdminStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return false

      // Check if user is in admin group
      const { data: isInGroup, error: groupError } = await supabase
        .rpc('is_user_in_admin_group', {
          user_id: user.id
        })

      if (groupError) {
        console.error('Error checking admin group status:', groupError)
        return false
      }

      // Also check profile is_admin flag and email
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single()

      if (profileError) {
        console.error('Error checking profile admin status:', profileError)
        return false
      }

      return isInGroup && profile?.is_admin === true && user.email === 'accounts@thewrightsupport.com'
    } catch (error) {
      console.error('Error checking admin status:', error)
      return false
    }
  }

  return {
    isLoading,
    addUserToAdminGroup,
    checkAdminStatus
  }
}
