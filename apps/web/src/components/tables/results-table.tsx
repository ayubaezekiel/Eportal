import { useUser } from "@/hooks/auth";
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
import { ResultForm } from "../forms";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { View } from "../view";

export function ResultsTable() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const { data: user } = useUser();
  const userType = user?.data?.user.userType === "student";

  const { data, isPending, refetch } = useQuery(
    userType
      ? orpc.results.getByStudent.queryOptions({
          input: { studentId: `${user?.data?.user.id}` },
        })
      : orpc.results.getAll.queryOptions()
  );

  const deleteResult = useMutation(
    orpc.results.delete.mutationOptions({
      onSuccess: () => {
        toast.success("Result deleted successfully");
        refetch();
      },
      onError: (err) => toast.error(err.message),
    })
  );

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Approved":
      case "Published":
        return "default";
      case "Verified":
        return "secondary";
      case "Submitted":
        return "outline";
      default:
        return "destructive";
    }
  };

  const result = data?.[0];
  type ResultType = typeof result;

  const getGradeVariant = (grade: string) => {
    if (["A", "B"].includes(grade)) return "default";
    if (["C", "D", "E"].includes(grade)) return "secondary";
    return "destructive";
  };

  const columns: ColumnDef<ResultType>[] = [
    {
      accessorKey: "user.matricNumber",
      header: "Matric No.",
      cell: ({ row }) => row.original?.user?.matricNumber || "N/A",
    },
    {
      accessorKey: "user.fullName",
      header: "Student Name",
      cell: ({ row }) => row.original?.user?.name || "N/A",
    },
    {
      accessorKey: "courses.courseCode",
      header: "Course Code",
      cell: ({ row }) => row.original?.courses?.courseCode || "N/A",
    },
    {
      accessorKey: "courses.courseTitle",
      header: "Course Title",
      cell: ({ row }) => row.original?.courses?.courseTitle || "N/A",
    },
    {
      accessorKey: "academic_sessions.sessionName",
      header: "Session",
      cell: ({ row }) => row.original?.academic_sessions?.sessionName || "N/A",
    },
    {
      accessorKey: "results.semester",
      header: "Semester",
      cell: ({ row }) => row.original?.results?.semester || "N/A",
    },
    {
      accessorKey: "results.caTotal",
      header: "CA",
      cell: ({ row }) => {
        const ca = row.original?.results?.caTotal;
        return ca ? `${parseFloat(ca).toFixed(2)}` : "0.00";
      },
    },
    {
      accessorKey: "results.examScore",
      header: "Exam",
      cell: ({ row }) => {
        const exam = row.original?.results?.examScore;
        return exam ? `${parseFloat(exam).toFixed(2)}` : "0.00";
      },
    },
    {
      accessorKey: "results.totalScore",
      header: "Total",
      cell: ({ row }) => {
        const total = row.original?.results?.totalScore;
        return total ? `${parseFloat(total).toFixed(2)}` : "0.00";
      },
    },
    {
      accessorKey: "results.grade",
      header: "Grade",
      cell: ({ row }) => {
        const grade = row.original?.results?.grade;
        return grade ? (
          <Badge variant={getGradeVariant(grade)}>{grade}</Badge>
        ) : (
          "N/A"
        );
      },
    },
    {
      accessorKey: "results.gradePoint",
      header: "GP",
      cell: ({ row }) => {
        const gp = row.original?.results?.gradePoint;
        return gp ? parseFloat(gp).toFixed(2) : "0.00";
      },
    },
    {
      accessorKey: "results.remark",
      header: "Remark",
      cell: ({ row }) => row.original?.results?.remark || "N/A",
    },
    {
      accessorKey: "results.status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original?.results?.status || "Draft";
        return <Badge variant={getStatusVariant(status)}>{status}</Badge>;
      },
    },
    {
      accessorKey: "results.isCarryOver",
      header: "C/O",
      cell: ({ row }) => (
        <Badge
          variant={row.original?.results?.isCarryOver ? "outline" : "secondary"}
        >
          {row.original?.results?.isCarryOver ? "Yes" : "No"}
        </Badge>
      ),
    },
    {
      accessorKey: "results.attemptNumber",
      header: "Attempt",
      cell: ({ row }) => row.original?.results?.attemptNumber || 1,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon-sm">
                <Edit className="h-4 w-4" />
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
              <ResultForm
                mode="update"
                result={{
                  id: row.original?.results?.id,
                  studentId: row.original?.results?.studentId as string,
                  courseId: row.original?.results?.courseId as string,
                  sessionId: row.original?.results?.sessionId as string,
                  semester: row.original?.results?.semester as string,
                  attendance: row.original?.results?.attendance || "0",
                  assignment: row.original?.results?.assignment || "0",
                  test1: row.original?.results?.test1 || "0",
                  test2: row.original?.results?.test2 || "0",
                  practical: row.original?.results?.practical || "0",
                  caTotal: row.original?.results?.caTotal || "0",
                  examScore: row.original?.results?.examScore || "0",
                  totalScore: row.original?.results?.totalScore || "0",
                  grade: row.original?.results?.grade || "",
                  gradePoint: row.original?.results?.gradePoint || "0",
                  remark: row.original?.results?.remark || "",
                  status: row.original?.results?.status || "Draft",
                  isCarryOver: row.original?.results?.isCarryOver || false,
                  attemptNumber: row.original?.results?.attemptNumber || 1,
                  uploadedBy: row.original?.results?.uploadedBy as string,
                  uploadedAt: new Date(`${row.original?.results?.uploadedAt}`),
                  verifiedBy: row.original?.results?.verifiedBy as string,
                  verifiedAt: new Date(`${row.original?.results?.verifiedAt}`),
                  approvedBy: row.original?.results?.approvedBy as string,
                  approvedAt: new Date(`${row.original?.results?.approvedAt}`),
                }}
              />
            </DialogContent>
          </Dialog>

          <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon-sm">
                <Eye className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Result Details</DialogTitle>
              </DialogHeader>
              <ResultDetails result={row.original} />
            </DialogContent>
          </Dialog>

          <Button
            variant="destructive"
            size="icon-sm"
            onClick={() => {
              toast("Are you sure you want to delete this result?", {
                action: {
                  label: "Delete",
                  onClick: () =>
                    deleteResult.mutate({ id: `${row.original?.results?.id}` }),
                },
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
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });

  return (
    <View isLoading={isPending} className="w-full">
      <div className="flex items-center gap-4 py-4">
        <Input
          placeholder="Filter by course code..."
          value={
            (table
              .getColumn("courses.courseCode")
              ?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table
              .getColumn("courses.courseCode")
              ?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <Input
          placeholder="Filter by matric number..."
          value={
            (table
              .getColumn("user.matricNumber")
              ?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table
              .getColumn("user.matricNumber")
              ?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
      </div>
      <div className="rounded-md border overflow-x-auto">
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
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between py-4">
        <div className="text-sm text-muted-foreground">
          Showing {table.getRowModel().rows.length} of {data?.length || 0}{" "}
          results
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

// Result Details Component
function ResultDetails({ result }: { result: any }) {
  if (!result) return null;

  const { results, courses, user, academic_sessions } = result;

  return (
    <div className="space-y-6">
      {/* Student Info */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-muted-foreground">
            Student Name
          </Label>
          <p className="text-base font-semibold">{user?.fullName || "N/A"}</p>
        </div>
        <div>
          <Label className="text-sm font-medium text-muted-foreground">
            Matric Number
          </Label>
          <p className="text-base font-semibold">
            {user?.matricNumber || "N/A"}
          </p>
        </div>
      </div>

      {/* Course Info */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-muted-foreground">
            Course Code
          </Label>
          <p className="text-base">{courses?.courseCode || "N/A"}</p>
        </div>
        <div>
          <Label className="text-sm font-medium text-muted-foreground">
            Course Title
          </Label>
          <p className="text-base">{courses?.courseTitle || "N/A"}</p>
        </div>
      </div>

      {/* Session Info */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label className="text-sm font-medium text-muted-foreground">
            Session
          </Label>
          <p className="text-base">{academic_sessions?.sessionName || "N/A"}</p>
        </div>
        <div>
          <Label className="text-sm font-medium text-muted-foreground">
            Semester
          </Label>
          <p className="text-base">{results?.semester || "N/A"}</p>
        </div>
        <div>
          <Label className="text-sm font-medium text-muted-foreground">
            Credit Units
          </Label>
          <p className="text-base">{courses?.creditUnits || "N/A"}</p>
        </div>
      </div>

      {/* CA Breakdown */}
      <div>
        <h4 className="text-sm font-semibold mb-3">
          Continuous Assessment Breakdown
        </h4>
        <div className="grid grid-cols-5 gap-4">
          <div className="text-center">
            <Label className="text-xs text-muted-foreground">Attendance</Label>
            <p className="text-lg font-semibold">
              {parseFloat(results?.attendance || "0").toFixed(2)}
            </p>
          </div>
          <div className="text-center">
            <Label className="text-xs text-muted-foreground">Assignment</Label>
            <p className="text-lg font-semibold">
              {parseFloat(results?.assignment || "0").toFixed(2)}
            </p>
          </div>
          <div className="text-center">
            <Label className="text-xs text-muted-foreground">Test 1</Label>
            <p className="text-lg font-semibold">
              {parseFloat(results?.test1 || "0").toFixed(2)}
            </p>
          </div>
          <div className="text-center">
            <Label className="text-xs text-muted-foreground">Test 2</Label>
            <p className="text-lg font-semibold">
              {parseFloat(results?.test2 || "0").toFixed(2)}
            </p>
          </div>
          <div className="text-center">
            <Label className="text-xs text-muted-foreground">Practical</Label>
            <p className="text-lg font-semibold">
              {parseFloat(results?.practical || "0").toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Scores */}
      <div className="grid grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
        <div className="text-center">
          <Label className="text-sm text-muted-foreground">CA Total</Label>
          <p className="text-2xl font-bold">
            {parseFloat(results?.caTotal || "0").toFixed(2)}
          </p>
        </div>
        <div className="text-center">
          <Label className="text-sm text-muted-foreground">Exam Score</Label>
          <p className="text-2xl font-bold">
            {parseFloat(results?.examScore || "0").toFixed(2)}
          </p>
        </div>
        <div className="text-center">
          <Label className="text-sm text-muted-foreground">Total Score</Label>
          <p className="text-2xl font-bold text-primary">
            {parseFloat(results?.totalScore || "0").toFixed(2)}
          </p>
        </div>
        <div className="text-center">
          <Label className="text-sm text-muted-foreground">Grade</Label>
          <p className="text-2xl font-bold">
            {results?.grade || "N/A"} (
            {parseFloat(results?.gradePoint || "0").toFixed(2)})
          </p>
        </div>
      </div>

      {/* Remark and Status */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-muted-foreground">
            Remark
          </Label>
          <p className="text-base">{results?.remark || "N/A"}</p>
        </div>
        <div>
          <Label className="text-sm font-medium text-muted-foreground">
            Status
          </Label>
          <Badge variant="default">{results?.status || "Draft"}</Badge>
        </div>
      </div>

      {/* Additional Info */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-muted-foreground">
            Carry Over
          </Label>
          <p className="text-base">{results?.isCarryOver ? "Yes" : "No"}</p>
        </div>
        <div>
          <Label className="text-sm font-medium text-muted-foreground">
            Attempt Number
          </Label>
          <p className="text-base">{results?.attemptNumber || 1}</p>
        </div>
      </div>
    </div>
  );
}
