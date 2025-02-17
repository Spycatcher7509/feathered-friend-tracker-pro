
import { Table, TableBody } from "@/components/ui/table"
import { UsersTableHeader } from "./UsersTableHeader"
import { UserRow } from "./UserRow"
import { Profile, EditingState } from "./types"

interface UsersTableProps {
  users: Profile[]
  editing: EditingState
  onStartEditing: (id: string, field: EditingState['field'], currentValue: string) => void
  onSaveEdit: () => void
  onCancelEditing: () => void
  onEditingChange: (value: string) => void
  onToggleAdmin: (userId: string, currentStatus: boolean) => void
  onDelete: (userId: string) => void
}

export function UsersTable({
  users,
  editing,
  onStartEditing,
  onSaveEdit,
  onCancelEditing,
  onEditingChange,
  onToggleAdmin,
  onDelete
}: UsersTableProps) {
  if (users.length === 0) {
    return (
      <div className="text-center py-4 border rounded-md">
        No users found. Try adjusting your search.
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <UsersTableHeader />
        <TableBody>
          {users.map((user) => (
            <UserRow
              key={user.id}
              user={user}
              editing={editing}
              onStartEditing={onStartEditing}
              onSaveEdit={onSaveEdit}
              onCancelEditing={onCancelEditing}
              onEditingChange={onEditingChange}
              onToggleAdmin={onToggleAdmin}
              onDelete={onDelete}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
