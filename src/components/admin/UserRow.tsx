
import { TableCell, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { EditableCell } from "./EditableCell"
import { UserActions } from "./UserActions"
import { Profile, EditingState } from "./types"

interface UserRowProps {
  user: Profile
  editing: EditingState
  onStartEditing: (id: string, field: EditingState['field'], currentValue: string) => void
  onSaveEdit: () => void
  onCancelEditing: () => void
  onEditingChange: (value: string) => void
  onToggleAdmin: (userId: string, currentStatus: boolean) => void
  onDelete: (userId: string) => void
}

export function UserRow({
  user,
  editing,
  onStartEditing,
  onSaveEdit,
  onCancelEditing,
  onEditingChange,
  onToggleAdmin,
  onDelete
}: UserRowProps) {
  return (
    <TableRow className="group">
      <TableCell>
        <EditableCell
          value={user.username}
          isEditing={editing.id === user.id && editing.field === 'username'}
          onEdit={() => onStartEditing(user.id, 'username', user.username)}
          onSave={onSaveEdit}
          onCancel={onCancelEditing}
          onChange={onEditingChange}
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
          onEdit={() => onStartEditing(user.id, 'location', user.location || '')}
          onSave={onSaveEdit}
          onCancel={onCancelEditing}
          onChange={onEditingChange}
          editValue={editing.value}
          placeholder="Not specified"
        />
      </TableCell>
      <TableCell>
        <EditableCell
          value={user.experience_level}
          isEditing={editing.id === user.id && editing.field === 'experience_level'}
          onEdit={() => onStartEditing(user.id, 'experience_level', user.experience_level || '')}
          onSave={onSaveEdit}
          onCancel={onCancelEditing}
          onChange={onEditingChange}
          editValue={editing.value}
          placeholder="Not specified"
        />
      </TableCell>
      <TableCell>
        <UserActions
          userId={user.id}
          isAdmin={user.is_admin}
          onToggleAdmin={onToggleAdmin}
          onDelete={onDelete}
        />
      </TableCell>
    </TableRow>
  )
}
