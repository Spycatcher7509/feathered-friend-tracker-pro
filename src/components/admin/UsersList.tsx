
import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { SearchBar } from "./SearchBar"
import { CreateUserDialog } from "./CreateUserDialog"
import { UsersTable } from "./UsersTable"
import { Profile, EditingState } from "./types"

export function UsersList() {
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [editing, setEditing] = useState<EditingState>({ id: null, field: null, value: "" })
  const { toast } = useToast()

  useEffect(() => {
    fetchUsers()
  }, [])

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

      console.log('Fetched profiles:', profiles)
      setUsers(profiles || [])
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

  const handleSearch = () => {
    fetchUsers(searchQuery)
  }

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
      
      fetchUsers()
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

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          onSearch={handleSearch}
        />
        <CreateUserDialog onUserCreated={fetchUsers} />
      </div>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p>Loading users...</p>
          </div>
        </div>
      ) : (
        <UsersTable
          users={users}
          editing={editing}
          onStartEditing={startEditing}
          onSaveEdit={saveEdit}
          onCancelEditing={cancelEditing}
          onEditingChange={(value) => setEditing(prev => ({ ...prev, value }))}
          onToggleAdmin={toggleAdminStatus}
          onDelete={deleteUser}
        />
      )}
    </div>
  )
}
