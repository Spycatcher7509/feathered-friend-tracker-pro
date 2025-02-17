
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Pencil, Check, X } from "lucide-react"

interface EditableCellProps {
  value: string | null
  isEditing: boolean
  onEdit: () => void
  onSave: () => void
  onCancel: () => void
  onChange: (value: string) => void
  editValue: string
  placeholder?: string
}

export function EditableCell({
  value,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onChange,
  editValue,
  placeholder = 'Full name or Nickname'
}: EditableCellProps) {
  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <Input
          value={editValue}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-[200px]"
          autoFocus
        />
        <Button variant="ghost" size="sm" onClick={onSave} className="h-8 w-8 p-0">
          <Check className="h-4 w-4 text-green-500" />
        </Button>
        <Button variant="ghost" size="sm" onClick={onCancel} className="h-8 w-8 p-0">
          <X className="h-4 w-4 text-red-500" />
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <span className="font-medium">{value || placeholder}</span>
      <Button
        variant="ghost"
        size="sm"
        onClick={onEdit}
        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Pencil className="h-4 w-4" />
      </Button>
    </div>
  )
}
