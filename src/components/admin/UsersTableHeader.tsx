
import { TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function UsersTableHeader() {
  return (
    <TableHeader>
      <TableRow>
        <TableHead className="w-[200px]">Logged On</TableHead>
        <TableHead className="w-[180px]">Username</TableHead>
        <TableHead className="w-[220px]">Email</TableHead>
        <TableHead className="w-[150px]">Admin Status</TableHead>
        <TableHead className="w-[180px]">Location</TableHead>
        <TableHead className="w-[180px]">Experience Level</TableHead>
        <TableHead className="w-[150px]">Actions</TableHead>
      </TableRow>
    </TableHeader>
  )
}
