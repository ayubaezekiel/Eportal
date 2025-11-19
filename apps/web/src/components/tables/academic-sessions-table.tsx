import type { AcademicSession } from "@/types/types";
import { orpc } from "@/utils/orpc";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Edit, Eye, Trash } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AcademicSessionForm } from "../forms";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { Input } from "../ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { PermissionGuard } from "../auth/permission-guard";

export function AcademicSessionsTable() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const { data, isPending, refetch } = useQuery(
    orpc.academicSessions.getAll.queryOptions()
  );

  const deleteSession = useMutation(
    orpc.academicSessions.delete.mutationOptions({
      onSuccess: () => {
        toast.success("Academic session deleted successfully");
        refetch();
      },
      onError: (err) => toast.error(err.message),
    })
  );

  const columns: ColumnDef<AcademicSession>[] = [
    {
      accessorKey: "sessionName",
      header: "Session",
    },
    {
      accessorKey: "startDate",
      header: "Start Date",
      cell: ({ getValue }) => {
        const date = getValue() as Date;
        return date ? new Date(date).toLocaleDateString() : "-";
      },
    },
    {
      accessorKey: "endDate",
      header: "End Date",
      cell: ({ getValue }) => {
        const date = getValue() as Date;
        return date ? new Date(date).toLocaleDateString() : "-";
      },
    },
    {
      accessorKey: "isCurrent",
      header: "Current",
      cell: ({ getValue }) => (
        <Badge variant={getValue() ? "default" : "secondary"}>
          {getValue() ? "Current" : "Past"}
        </Badge>
      ),
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ getValue }) => (
        <Badge variant={getValue() ? "default" : "secondary"}>
          {getValue() ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <PermissionGuard permission="settings:update">
            <Button variant="secondary" size="icon-sm">
              <Eye className="h-4 w-4" />
            </Button>
          </PermissionGuard>
          <PermissionGuard permission="settings:update">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon-sm">
                  <Edit className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <AcademicSessionForm mode="update" session={row.original} />
              </DialogContent>
            </Dialog>
          </PermissionGuard>
          <PermissionGuard permission="settings:update">
            <Button
              variant="destructive"
              size="icon-sm"
              onClick={() => {
                toast.success("Are you sure you want to delete this session?", {
                  action: (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() =>
                        deleteSession.mutate({ id: row.original.id })
                      }
                    >
                      Delete
                    </Button>
                  ),
                  cancel: "Cancel",
                });
              }}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </PermissionGuard>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: data || [],
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });

  if (isPending) return <div>Loading...</div>;

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter sessions..."
          value={
            (table.getColumn("sessionName")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn("sessionName")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
