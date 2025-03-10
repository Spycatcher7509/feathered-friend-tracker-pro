
import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Profile, formatDateTimeGB } from "../types"

export function useUsers() {
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [hasPendingSupport, setHasPendingSupport] = useState(false)
  const { toast } = useToast()

  const subscribeToSupportRequests = () => {
    console.log('Setting up support request subscription')
    
    // Listen for new conversations
    const conversationsChannel = supabase
      .channel('new_conversations')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'conversations'
        },
        (payload) => {
          console.log('New conversation detected:', payload)
          if (payload.new) {
            setHasPendingSupport(true)
            toast({
              title: "New Support Request",
              description: "A user is requesting technical support",
              variant: "default",
            })
          }
        }
      )
      .subscribe()
    
    // Listen for new messages
    const messagesChannel = supabase
      .channel('new_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          console.log('New message detected:', payload)
          if (payload.new && !payload.new.is_system_message) {
            setHasPendingSupport(true)
            toast({
              title: "New Support Message",
              description: "A user has sent a new message in support chat",
              variant: "default",
            })
          }
        }
      )
      .subscribe()

    return () => {
      console.log('Cleaning up support request subscriptions')
      supabase.removeChannel(conversationsChannel)
      supabase.removeChannel(messagesChannel)
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

      // Debug logging for timestamp data
      if (profiles && profiles.length > 0) {
        console.log('Sample profile data:', profiles[0])
        console.log('Sample logged_on value:', profiles[0].logged_on)
      }

      // Format the logged_on timestamps with detailed error checking
      const formattedProfiles = profiles?.map(profile => {
        console.log(`Processing profile for ${profile.username || 'unknown'}, logged_on:`, profile.logged_on)
        
        let formattedDate = 'Never logged in'
        if (profile.logged_on) {
          try {
            formattedDate = formatDateTimeGB(profile.logged_on)
            console.log(`Successfully formatted date for ${profile.username}:`, formattedDate)
          } catch (e) {
            console.error(`Error formatting date for ${profile.username}:`, e)
            formattedDate = 'Invalid date'
          }
        } else {
          console.log(`No logged_on value for ${profile.username}`)
        }
        
        return {
          ...profile,
          logged_on_formatted: formattedDate
        }
      }) || []

      console.log('Profiles after formatting:', formattedProfiles)
      setUsers(formattedProfiles)
      
      // Check for active support conversations
      const { data: conversations, error: convError } = await supabase
        .from('conversations')
        .select('status')
        .eq('status', 'active')
      
      if (!convError && conversations && conversations.length > 0) {
        console.log('Found active support conversations:', conversations.length)
        setHasPendingSupport(true)
      } else {
        console.log('No active support conversations found')
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

  // Run once on component mount to check for existing support requests
  useEffect(() => {
    const checkExistingRequests = async () => {
      try {
        console.log('Checking for existing support conversations')
        const { data, error } = await supabase
          .from('conversations')
          .select('id')
          .eq('status', 'active')
        
        if (error) throw error
        
        if (data && data.length > 0) {
          console.log('Found existing support conversations:', data.length)
          setHasPendingSupport(true)
        }
      } catch (error) {
        console.error('Error checking for support conversations:', error)
      }
    }
    
    checkExistingRequests()
  }, [])

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
