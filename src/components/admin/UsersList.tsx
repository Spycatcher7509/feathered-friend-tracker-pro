
import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { EditableCell } from "./EditableCell"
import { UserActions } from "./UserActions"
import { UsersTableHeader } from "./UsersTableHeader"
import { SearchBar } from "./SearchBar"

interface Profile {
  id: string
  username: string
  email?: string
  is_admin: boolean
  location?: string
  experience_level?: string
}

interface EditingState {
  id: string | null
  field: 'username' | 'location' | 'experience_level' | null
  value: string
}

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
      console.log('Fetching users...', search ? `with search: ${search}` : '')
      let query = supabase
        .from('profiles')
        .select()
        
      if (search) {
        query = query.or(`email.ilike.%${search}%,username.ilike.%${search}%,location.ilike.%${search}%,experience_level.ilike.%${search}%`)
      }
      
      const { data: profiles, error } = await query.order('created_at', { ascending: false })

      if (error) throw error

      console.log('Fetched profiles:', profiles)
      setUsers(profiles)
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
    setLoading(true)
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

  if (loading) {
    return <div>Loading users...</div>
  }

  return (
    <div className="space-y-4">
      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        onSearch={handleSearch}
      />
      
      <div className="rounded-md border">
        <Table>
          <UsersTableHeader />
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} className="group">
                <TableCell>
                  <EditableCell
                    value={user.username}
                    isEditing={editing.id === user.id && editing.field === 'username'}
                    onEdit={() => startEditing(user.id, 'username', user.username)}
                    onSave={saveEdit}
                    onCancel={cancelEditing}
                    onChange={(value) => setEditing(prev => ({ ...prev, value }))}
                    editValue={editing.value}
                  />
                </TableCell>
                <TableCell>{user.email || 'No email'}</TableCell>
                <TableCell>
                  {user.is_admin ? (
                    <Badge className="bg-green-500">Admin</Badge>
                  ) : (
                    <Badge variant="secondary">User</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <EditableCell
                    value={user.location}
                    isEditing={editing.id === user.id && editing.field === 'location'}
                    onEdit={() => startEditing(user.id, 'location', user.location || '')}
                    onSave={saveEdit}
                    onCancel={cancelEditing}
                    onChange={(value) => setEditing(prev => ({ ...prev, value }))}
                    editValue={editing.value}
                    placeholder="Not specified"
                  />
                </TableCell>
                <TableCell>
                  <EditableCell
                    value={user.experience_level}
                    isEditing={editing.id === user.id && editing.field === 'experience_level'}
                    onEdit={() => startEditing(user.id, 'experience_level', user.experience_level || '')}
                    onSave={saveEdit}
                    onCancel={cancelEditing}
                    onChange={(value) => setEditing(prev => ({ ...prev, value }))}
                    editValue={editing.value}
                    placeholder="Not specified"
                  />
                </TableCell>
                <TableCell>
                  <UserActions
                    userId={user.id}
                    isAdmin={user.is_admin}
                    onToggleAdmin={toggleAdminStatus}
                    onDelete={deleteUser}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
