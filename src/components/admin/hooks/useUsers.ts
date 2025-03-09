
import { useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Profile, formatDateTimeGB } from "../types"

export function useUsers() {
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [hasPendingSupport, setHasPendingSupport] = useState(false)
  const { toast } = useToast()

  const subscribeToSupportRequests = () => {
    const channel = supabase
      .channel('chat')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'conversations'
        },
        (payload) => {
          if (payload.new) {
            // New conversation started
            setHasPendingSupport(true)
            toast({
              title: "Support Request",
              description: "A user is requesting support",
              variant: "default",
            })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const fetchUsers = async (search?: string) => {
    try {
      console.log('Fetching users with search:', search)
      setLoading(true)
      
      let query = supabase
        .from('profiles')
        .select('*')
      
      if (search) {
        query = query.or(`email.ilike.%${search}%,username.ilike.%${search}%,location.ilike.%${search}%`)
      }
      
      const { data: profiles, error } = await query.order('created_at', { ascending: false })

      if (error) throw error

      const formattedProfiles = profiles?.map(profile => ({
        ...profile,
        logged_on_formatted: formatDateTimeGB(profile.logged_on)
      })) || []

      console.log('Fetched profiles:', formattedProfiles)
      setUsers(formattedProfiles)
      
      const { data: conversations, error: convError } = await supabase
        .from('conversations')
        .select('status')
        .eq('status', 'active')
        .limit(1)
      
      if (!convError && conversations && conversations.length > 0) {
        setHasPendingSupport(true)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const toggleAdminStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_admin: !currentStatus })
        .eq('id', userId)

      if (error) throw error

      toast({
        title: "Success",
        description: `User ${currentStatus ? "demoted" : "promoted"} successfully`,
      })
      
      fetchUsers()
    } catch (error) {
      console.error('Error updating admin status:', error)
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive",
      })
    }
  }

  const deleteUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId)

      if (error) throw error

      toast({
        title: "Success",
        description: "User deleted successfully",
      })
      
      fetchUsers()
    } catch (error) {
      console.error('Error deleting user:', error)
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      })
    }
  }

  return { 
    users, 
    loading, 
    hasPendingSupport, 
    setHasPendingSupport,
    fetchUsers, 
    toggleAdminStatus, 
    deleteUser, 
    subscribeToSupportRequests 
  }
}
