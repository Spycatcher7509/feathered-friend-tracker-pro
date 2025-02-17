
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
import { Shield, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function UsersList() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      console.log('Fetching users...')
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select()
        .order('username')

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
      
      // Refresh the users list
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
      
      // Refresh the users list
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
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Username</TableHead>
            <TableHead>Admin Status</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Experience Level</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.username || 'Anonymous User'}</TableCell>
              <TableCell>
                {user.is_admin ? (
                  <Badge className="bg-green-500">Admin</Badge>
                ) : (
                  <Badge variant="secondary">User</Badge>
                )}
              </TableCell>
              <TableCell>{user.location || 'Not specified'}</TableCell>
              <TableCell>{user.experience_level || 'Not specified'}</TableCell>
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
  )
}
