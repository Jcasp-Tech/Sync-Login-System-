import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MoreHorizontal } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function DocumentsTable() {
  const documents = [
    {
      id: 1,
      header: 'Cover page',
      sectionType: 'Cover page',
      status: 'In Process',
      target: 'Target',
      limit: 'Limit',
      reviewer: 'Eddie Lake',
    },
    {
      id: 2,
      header: 'Table of contents',
      sectionType: 'Table of contents',
      status: 'Done',
      target: 'Target',
      limit: 'Limit',
      reviewer: 'Eddie Lake',
    },
    {
      id: 3,
      header: 'Executive summary',
      sectionType: 'Narrative',
      status: 'Done',
      target: 'Target',
      limit: 'Limit',
      reviewer: 'Eddie Lake',
    },
    {
      id: 4,
      header: 'Technical approach',
      sectionType: 'Narrative',
      status: 'Done',
      target: 'Target',
      limit: 'Limit',
      reviewer: 'Jamik Tashpulatov',
    },
    {
      id: 5,
      header: 'Design',
      sectionType: 'Narrative',
      status: 'In Process',
      target: 'Target',
      limit: 'Limit',
      reviewer: 'Jamik Tashpulatov',
    },
    {
      id: 6,
      header: 'Capabilities',
      sectionType: 'Narrative',
      status: 'In Process',
      target: 'Target',
      limit: 'Limit',
      reviewer: 'Jamik Tashpulatov',
    },
  ]

  const getStatusBadge = (status) => {
    if (status === 'Done') {
      return <Badge variant="default">Done</Badge>
    }
    return <Badge variant="secondary">In Process</Badge>
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Documents</CardTitle>
            <CardDescription>Manage your documents and sections</CardDescription>
          </div>
          <Button>Add Document</Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Header</TableHead>
              <TableHead>Section Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>Limit</TableHead>
              <TableHead>Reviewer</TableHead>
              <TableHead className="text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell className="font-medium">{doc.header}</TableCell>
                <TableCell>{doc.sectionType}</TableCell>
                <TableCell>{getStatusBadge(doc.status)}</TableCell>
                <TableCell>{doc.target}</TableCell>
                <TableCell>{doc.limit}</TableCell>
                <TableCell>{doc.reviewer}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem>Duplicate</DropdownMenuItem>
                      <DropdownMenuItem>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
          <div>0 of {documents.length} row(s) selected.</div>
          <div className="flex items-center gap-2">
            <span>Rows per page</span>
            <span>Page 1 of 1</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

