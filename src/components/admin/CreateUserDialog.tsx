
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useAdminGroups } from "@/hooks/useAdminGroups"
import { Plus } from "lucide-react"

interface NewUserData {
  email: string
  username: string
  location: string
  experience_level: string
  is_admin: boolean
}

const experienceLevels = ['beginner', 'intermediate', 'advanced', 'expert'] as const

export function CreateUserDialog({ onUserCreated }: { onUserCreated: () => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { addUserToAdminGroup } = useAdminGroups()

  const [userData, setUserData] = useState<NewUserData>({
    email: "",
    username: "",
    location: "",
    experience_level: "",
    is_admin: false
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      const { data, error } = await supabase.functions.invoke('create-admin-user', {
        body: userData
      })

      if (error) throw error

      // If user should be admin, add them to admin group
      if (userData.is_admin) {
        await addUserToAdminGroup(userData.email)
      }

      toast({
        title: "Success",
        description: "User created successfully",
      })

      onUserCreated()
      setIsOpen(false)
      setUserData({
        email: "",
        username: "",
        location: "",
        experience_level: "",
        is_admin: false
      })
    } catch (error) {
      console.error('Error creating user:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create user",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={userData.email}
              onChange={(e) => setUserData(prev => ({ ...prev, email: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Full Name or Nickname</Label>
            <Input
              id="username"
              required
              value={userData.username}
              onChange={(e) => setUserData(prev => ({ ...prev, username: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={userData.location}
              onChange={(e) => setUserData(prev => ({ ...prev, location: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="experience_level">Experience Level</Label>
            <Select
              value={userData.experience_level}
              onValueChange={(value) => setUserData(prev => ({ ...prev, experience_level: value }))}
            >
              <SelectTrigger id="experience_level">
                <SelectValue placeholder="Select experience level" />
              </SelectTrigger>
              <SelectContent>
                {experienceLevels.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_admin"
              checked={userData.is_admin}
              onChange={(e) => setUserData(prev => ({ ...prev, is_admin: e.target.checked }))}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="is_admin">Make user an admin</Label>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create User"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
