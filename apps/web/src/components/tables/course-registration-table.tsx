import type { CourseRegistration } from "@/types/types";
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
import {
  ArrowUpDown,
  CheckCircle2,
  Clock,
  Edit,
  Trash,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { CourseRegistrationForStudentForm } from "../forms/course-registration";
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
import { View } from "../view";
import { useUser } from "@/hooks/auth";

// Type for the joined data structure
type CourseRegistrationWithRelations = {
  course_registrations: CourseRegistration;
  courses: {
    id: string;
    courseCode: string;
    courseTitle: string;
    creditUnits: number;
    courseType: string;
    level: string;
    semester: string;
    isActive: boolean;
  };
  students: {
    id: string;
    name?: string;
  };
  sessions: {
    id: string;
    name?: string;
    startYear?: number;
    endYear?: number;
  };
};

const StatusBadge = ({ status }: { status: string }) => {
  const variants = {
    Pending: {
      variant: "secondary" as const,
      icon: Clock,
      color: "text-yellow-600",
    },
    Approved: {
      variant: "default" as const,
      icon: CheckCircle2,
      color: "text-green-600",
    },
    Rejected: {
      variant: "destructive" as const,
      icon: XCircle,
      color: "text-red-600",
    },
  };

  const config = variants[status as keyof typeof variants] || variants.Pending;
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className="gap-1">
      <Icon className={`h-3 w-3 ${config.color}`} />
      {status}
    </Badge>
  );
};

const ApprovalStatus = ({
  approved,
  approvedAt,
}: {
  approved: boolean;
  approvedAt?: Date | null;
}) => {
  if (approved) {
    return (
      <div className="flex items-center gap-2 text-green-600">
        <CheckCircle2 className="h-4 w-4" />
        <div className="text-xs">
          <div className="font-medium">Approved</div>
          {approvedAt && (
            <div className="text-muted-foreground">
              {new Date(approvedAt).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <Clock className="h-4 w-4" />
      <span className="text-xs">Pending</span>
    </div>
  );
};

export function StudentCoursesTable() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const { data: user, isPending: isUserPending } = useUser();
  const { data, isPending, refetch } = useQuery({
    ...orpc.courseRegistrations.getByStudent.queryOptions({
      input: { studentId: `${user?.data?.user.id}` },
    }),
    enabled: !!user?.data?.user.id,
  });

  const deleteCourse = useMutation(
    orpc.courseRegistrations.delete.mutationOptions({
      onSuccess: () => {
        toast.success("Course deleted successfully");
        refetch();
      },
      onError: (err) => toast.error(err.message),
    })
  );

  const columns: ColumnDef<CourseRegistrationWithRelations>[] = [
    {
      accessorKey: "courses.courseCode",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2"
        >
          Course Code
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      accessorFn: (row) => row.courses.courseCode,
      cell: ({ row }) => (
        <div className="font-mono font-semibold text-sm">
          {row.original.courses.courseCode}
        </div>
      ),
    },
    {
      accessorKey: "courses.courseTitle",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2"
        >
          Course Title
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      accessorFn: (row) => row.courses.courseTitle,
      cell: ({ row }) => (
        <div className="max-w-[300px]">
          <div className="font-medium">{row.original.courses.courseTitle}</div>
        </div>
      ),
    },
    {
      accessorKey: "courses.creditUnits",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2"
        >
          Units
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      accessorFn: (row) => row.courses.creditUnits,
      cell: ({ row }) => (
        <div className="text-center font-semibold">
          {row.original.courses.creditUnits}
        </div>
      ),
    },
    {
      accessorKey: "courses.courseType",
      header: "Type",
      accessorFn: (row) => row.courses.courseType,
      cell: ({ row }) => (
        <Badge
          variant={
            row.original.courses.courseType === "Core" ? "default" : "outline"
          }
        >
          {row.original.courses.courseType}
        </Badge>
      ),
    },
    {
      accessorKey: "courses.level",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2"
        >
          Level
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      accessorFn: (row) => row.courses.level,
      cell: ({ row }) => (
        <Badge variant="secondary">{row.original.courses.level}</Badge>
      ),
    },
    {
      accessorKey: "course_registrations.semester",
      header: "Semester",
      accessorFn: (row) => row.course_registrations.semester,
      cell: ({ row }) => (
        <Badge variant="outline">
          {row.original.course_registrations.semester}
        </Badge>
      ),
    },
    {
      accessorKey: "course_registrations.registrationType",
      header: "Reg. Type",
      accessorFn: (row) => row.course_registrations.registrationType,
      cell: ({ row }) => {
        const type = row.original.course_registrations.registrationType;
        const variant =
          type === "Normal"
            ? "default"
            : type === "Carry Over"
            ? "destructive"
            : "secondary";
        return <Badge variant={variant}>{type}</Badge>;
      },
    },
    {
      accessorKey: "course_registrations.status",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2"
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      accessorFn: (row) => row.course_registrations.status,
      cell: ({ row }) => (
        <StatusBadge
          status={row.original.course_registrations.status || "Pending"}
        />
      ),
    },
    {
      accessorKey: "course_registrations.adviserApproved",
      header: "Adviser",
      accessorFn: (row) => row.course_registrations.adviserApproved,
      cell: ({ row }) => (
        <ApprovalStatus
          approved={Boolean(row.original.course_registrations.adviserApproved)}
          approvedAt={row.original.course_registrations.adviserApprovedAt}
        />
      ),
    },
    {
      accessorKey: "course_registrations.hodApproved",
      header: "HOD",
      accessorFn: (row) => row.course_registrations.hodApproved,
      cell: ({ row }) => (
        <ApprovalStatus
          approved={Boolean(row.original.course_registrations.hodApproved)}
          approvedAt={row.original.course_registrations.hodApprovedAt}
        />
      ),
    },
    {
      accessorKey: "course_registrations.registrationDate",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2"
        >
          Reg. Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      accessorFn: (row) => row.course_registrations.registrationDate,
      cell: ({ row }) => (
        <div className="text-xs text-muted-foreground">
          {row.original.course_registrations.registrationDate
            ? new Date(
                row.original.course_registrations.registrationDate
              ).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            : "N/A"}
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon-sm">
                <Edit className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <CourseRegistrationForStudentForm
                mode="update"
                courseRegistration={{
                  id: row.original.course_registrations.id,
                  studentId: row.original.course_registrations.studentId,
                  courseId: row.original.course_registrations.courseId,
                  sessionId: row.original.course_registrations.sessionId,
                  semester: row.original.course_registrations.semester as
                    | "First"
                    | "Second",
                  registrationType: row.original.course_registrations
                    .registrationType as "Normal" | "Carry Over" | "Spillover",
                  registrationDate: new Date(
                    `${row.original.course_registrations.registrationDate}`
                  ),
                  adviserApproved: Boolean(
                    row.original.course_registrations.adviserApproved
                  ),
                  hodApproved: Boolean(
                    row.original.course_registrations.hodApproved
                  ),
                  status: row.original.course_registrations.status as
                    | "Pending"
                    | "Approved"
                    | "Rejected",
                }}
              />
            </DialogContent>
          </Dialog>
          <Button
            variant="destructive"
            size="icon-sm"
            onClick={() => {
              toast.success("Are you sure you want to delete this course?", {
                action: (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() =>
                      deleteCourse.mutate({
                        id: row.original.course_registrations.id,
                      })
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
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: data || [],
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  // Calculate totals
  const totalCredits =
    data?.reduce((sum, row) => sum + (row.courses?.creditUnits || 0), 0) || 0;

  const approvedCount =
    data?.filter((row) => row.course_registrations.status === "Approved")
      .length || 0;

  return (
    <View isLoading={isPending || isUserPending} className="w-full space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-lg border bg-card p-4">
          <div className="text-sm font-medium text-muted-foreground">
            Total Courses
          </div>
          <div className="text-2xl font-bold">{data?.length || 0}</div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="text-sm font-medium text-muted-foreground">
            Total Credits
          </div>
          <div className="text-2xl font-bold">{totalCredits}</div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="text-sm font-medium text-muted-foreground">
            Approved
          </div>
          <div className="text-2xl font-bold text-green-600">
            {approvedCount}
          </div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="text-sm font-medium text-muted-foreground">
            Pending
          </div>
          <div className="text-2xl font-bold text-yellow-600">
            {(data?.length || 0) - approvedCount}
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search courses, codes, or types..."
          value={globalFilter ?? ""}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="max-w-sm"
        />
        <div className="flex gap-2">
          <select
            title="filter"
            value={
              (table
                .getColumn("course_registrations.status")
                ?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table
                .getColumn("course_registrations.status")
                ?.setFilterValue(event.target.value || undefined)
            }
            className="h-10 rounded-md border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
          <select
            title="filter"
            value={
              (table
                .getColumn("courses.courseType")
                ?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table
                .getColumn("courses.courseType")
                ?.setFilterValue(event.target.value || undefined)
            }
            className="h-10 rounded-md border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="">All Types</option>
            <option value="Core">Core</option>
            <option value="Elective">Elective</option>
            <option value="Required">Required</option>
          </select>
        </div>
      </div>

      {/* Table */}
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
                <TableRow
                  key={row.id}
                  className="hover:bg-muted/50 transition-colors"
                >
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
                  No course registrations found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing{" "}
          {table.getState().pagination.pageIndex *
            table.getState().pagination.pageSize +
            1}{" "}
          to{" "}
          {Math.min(
            (table.getState().pagination.pageIndex + 1) *
              table.getState().pagination.pageSize,
            data?.length || 0
          )}{" "}
          of {data?.length || 0} entries
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <div className="text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </div>
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
    </View>
  );
}
