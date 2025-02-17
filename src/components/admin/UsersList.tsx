
import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Shield, Trash2, Search, Pencil, Check, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"

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

      if (error) {
        console.error('Error fetching profiles:', error)
        throw error
      }

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
      
      // Refresh the users list
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

  const renderEditableCell = (user: Profile, field: EditingState['field'], value: string | null) => {
    const isEditing = editing.id === user.id && editing.field === field

    if (isEditing) {
      return (
        <div className="flex items-center gap-2">
          <Input
            value={editing.value}
            onChange={(e) => setEditing(prev => ({ ...prev, value: e.target.value }))}
            className="h-8 w-[200px]"
            autoFocus
          />
          <Button variant="ghost" size="sm" onClick={saveEdit} className="h-8 w-8 p-0">
            <Check className="h-4 w-4 text-green-500" />
          </Button>
          <Button variant="ghost" size="sm" onClick={cancelEditing} className="h-8 w-8 p-0">
            <X className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      )
    }

    return (
      <div className="flex items-center gap-2">
        <span className="font-medium">{value || 'Full name or Nickname'}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => startEditing(user.id, field, value || '')}
          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  if (loading) {
    return <div>Loading users...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Search by email, username, location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="max-w-sm"
        />
        <Button onClick={handleSearch}>
          <Search className="h-4 w-4 mr-1" />
          Search
        </Button>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Admin Status</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Experience Level</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} className="group">
                <TableCell>
                  {renderEditableCell(user, 'username', user.username)}
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
                  {renderEditableCell(user, 'location', user.location)}
                </TableCell>
                <TableCell>
                  {renderEditableCell(user, 'experience_level', user.experience_level)}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleAdminStatus(user.id, user.is_admin)}
                    >
                      <Shield className="h-4 w-4 mr-1" />
                      {user.is_admin ? 'Remove Admin' : 'Make Admin'}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteUser(user.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
