
import { useState, useEffect } from "react"
import { SearchBar } from "./SearchBar"
import { CreateUserDialog } from "./CreateUserDialog"
import { UsersTable } from "./UsersTable"
import { SupportNotification } from "./SupportNotification"
import { useUsers } from "./hooks/useUsers"
import { useUserEditing } from "./hooks/useUserEditing"

export function UsersList() {
  const [searchQuery, setSearchQuery] = useState("")
  const { 
    users, 
    loading, 
    hasPendingSupport, 
    setHasPendingSupport,
    fetchUsers, 
    toggleAdminStatus, 
    deleteUser, 
    subscribeToSupportRequests 
  } = useUsers()
  
  const { 
    editing,
    startEditing,
    cancelEditing,
    saveEdit,
    setEditingValue
  } = useUserEditing(fetchUsers)

  useEffect(() => {
    fetchUsers()
    subscribeToSupportRequests()
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
          <SupportNotification 
            hasPendingSupport={hasPendingSupport} 
            onCheckSupport={checkForSupportRequests} 
          />
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
