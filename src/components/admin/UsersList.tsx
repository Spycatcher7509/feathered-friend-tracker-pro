
import { useState, useEffect } from "react"
import { SearchBar } from "./SearchBar"
import { CreateUserDialog } from "./CreateUserDialog"
import { UsersTable } from "./UsersTable"
import { SupportNotification } from "./SupportNotification"
import { useUsers } from "./hooks/useUsers"
import { useUserEditing } from "./hooks/useUserEditing"
import { useUserSupport } from "./context/UserSupportContext"

export function UsersList() {
  const [searchQuery, setSearchQuery] = useState("")
  const { 
    users, 
    loading, 
    fetchUsers, 
    toggleAdminStatus, 
    deleteUser 
  } = useUsers()
  
  const { setHasPendingSupport } = useUserSupport()
  
  const { 
    editing,
    startEditing,
    cancelEditing,
    saveEdit,
    setEditingValue
  } = useUserEditing(fetchUsers)

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleSearch = () => {
    fetchUsers(searchQuery)
  }

  const checkForSupportRequests = () => {
    window.open('/support-chat', '_blank')
    setHasPendingSupport(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          onSearch={handleSearch}
        />
        <div className="flex items-center gap-2">
          <SupportNotification onCheckSupport={checkForSupportRequests} />
          <CreateUserDialog onUserCreated={fetchUsers} />
        </div>
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
          onEditingChange={setEditingValue}
          onToggleAdmin={toggleAdminStatus}
          onDelete={deleteUser}
        />
      )}
    </div>
  )
}
