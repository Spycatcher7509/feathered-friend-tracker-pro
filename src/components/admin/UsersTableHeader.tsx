
import { TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function UsersTableHeader() {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>Logged On</TableHead>
        <TableHead>Username</TableHead>
        <TableHead>Email</TableHead>
        <TableHead>Admin Status</TableHead>
        <TableHead>Location</TableHead>
        <TableHead>Experience Level</TableHead>
        <TableHead>Actions</TableHead>
      </TableRow>
    </TableHeader>
  )
}
