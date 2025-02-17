
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { useAdminGroups } from "@/hooks/useAdminGroups"
import PageLayout from "@/components/layout/PageLayout"
import Navigation from "@/components/Navigation"

export default function UserManagement() {
  const [email, setEmail] = useState("")
  const { addUserToAdminGroup, isLoading } = useAdminGroups()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      await addUserToAdminGroup(email)
      setEmail("")
    }
  }

  return (
    <PageLayout header={<Navigation />}>
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>Add users to the admin group</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  type="email"
                  placeholder="Enter user email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Adding..." : "Add to Admin Group"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  )
}
