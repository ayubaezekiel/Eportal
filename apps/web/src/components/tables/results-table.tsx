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
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { ResultForm } from "../forms";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
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
  const [editingResult, setEditingResult] = useState<any>(null);
  const [viewingResult, setViewingResult] = useState<any>(null);
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

  const columns: ColumnDef<ResultType>[] = useMemo(
    () => [
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
        cell: ({ row }) =>
          row.original?.academic_sessions?.sessionName || "N/A",
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
            variant={
              row.original?.results?.isCarryOver ? "outline" : "secondary"
            }
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
            {!userType && (
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => setEditingResult(row.original)}
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setViewingResult(row.original)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            {!userType && (
              <Button
                variant="destructive"
                size="icon-sm"
                onClick={() => {
                  toast("Are you sure you want to delete this result?", {
                    action: {
                      label: "Delete",
                      onClick: () =>
                        deleteResult.mutate({
                          id: `${row.original?.results?.id}`,
                        }),
                    },
                    cancel: "Cancel",
                  });
                }}
              >
                <Trash className="h-4 w-4" />
              </Button>
            )}
          </div>
        ),
      },
    ],
    []
  );

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

      {/* Edit Dialog */}
      <Dialog
        open={!!editingResult}
        onOpenChange={(open) => !open && setEditingResult(null)}
      >
        <DialogContent className="sm:max-w-240 max-h-[90vh] overflow-y-auto">
          {editingResult && (
            <ResultForm
              mode="update"
              result={{
                id: editingResult?.results?.id,
                studentId: editingResult?.results?.studentId as string,
                courseId: editingResult?.results?.courseId as string,
                sessionId: editingResult?.results?.sessionId as string,
                semester: editingResult?.results?.semester as string,
                attendance: editingResult?.results?.attendance || "0",
                assignment: editingResult?.results?.assignment || "0",
                test1: editingResult?.results?.test1 || "0",
                test2: editingResult?.results?.test2 || "0",
                practical: editingResult?.results?.practical || "0",
                caTotal: editingResult?.results?.caTotal || "0",
                examScore: editingResult?.results?.examScore || "0",
                totalScore: editingResult?.results?.totalScore || "0",
                grade: editingResult?.results?.grade || "",
                gradePoint: editingResult?.results?.gradePoint || "0",
                remark: editingResult?.results?.remark || "",
                status: editingResult?.results?.status || "Draft",
                isCarryOver: editingResult?.results?.isCarryOver || false,
                attemptNumber: editingResult?.results?.attemptNumber || 1,
                uploadedBy: editingResult?.results?.uploadedBy as string,
                uploadedAt: new Date(`${editingResult?.results?.uploadedAt}`),
                verifiedBy: editingResult?.results?.verifiedBy as string,
                verifiedAt: new Date(`${editingResult?.results?.verifiedAt}`),
                approvedBy: editingResult?.results?.approvedBy as string,
                approvedAt: new Date(`${editingResult?.results?.approvedAt}`),
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog
        open={!!viewingResult}
        onOpenChange={(open) => !open && setViewingResult(null)}
      >
        <DialogContent className="sm:max-w-240 h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Result Details</DialogTitle>
          </DialogHeader>

          {viewingResult && <ResultDetails result={viewingResult} />}
        </DialogContent>
      </Dialog>
    </View>
  );
}

// Result Details Component
function ResultDetails({ result }: { result: any }) {
  if (!result) return null;

  const { results, courses, user, academic_sessions } = result;

  const getGradeVariant = (grade: string) => {
    if (["A", "B"].includes(grade)) return "default";
    if (["C", "D", "E"].includes(grade)) return "secondary";
    return "destructive";
  };

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

  return (
    <div className="space-y-6">
      {/* Student & Course Header */}
      <div className="bg-linear-to-br from-primary/5 via-accent/5 to-secondary/5 rounded-lg p-6 border border-primary/10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Student Information
              </Label>
              <div className="mt-2 space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="text-lg font-semibold text-foreground">
                    {user?.fullName || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Matric Number</p>
                  <p className="text-base font-mono font-medium text-primary">
                    {user?.matricNumber || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Course Information
              </Label>
              <div className="mt-2 space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Course Code</p>
                  <p className="text-lg font-semibold font-mono text-foreground">
                    {courses?.courseCode || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Course Title</p>
                  <p className="text-base font-medium text-foreground">
                    {courses?.courseTitle || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Session Details */}
        <div className="mt-6 pt-4 border-t border-border/50">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                Session
              </p>
              <p className="text-sm font-semibold text-foreground">
                {academic_sessions?.sessionName || "N/A"}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                Semester
              </p>
              <p className="text-sm font-semibold text-foreground">
                {results?.semester || "N/A"}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                Credit Units
              </p>
              <p className="text-sm font-semibold text-foreground">
                {courses?.creditUnits || "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CA Breakdown */}
      <div className="border border-border rounded-lg p-5 bg-card">
        <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <span className="h-1 w-1 rounded-full bg-primary"></span>
          Continuous Assessment Breakdown
        </h4>
        <div className="grid grid-cols-5 gap-3">
          {[
            { label: "Attendance", value: results?.attendance },
            { label: "Assignment", value: results?.assignment },
            { label: "Test 1", value: results?.test1 },
            { label: "Test 2", value: results?.test2 },
            { label: "Practical", value: results?.practical },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-muted/50 rounded-md p-3 text-center border border-border/50 hover:border-primary/50 transition-colors"
            >
              <Label className="text-xs text-muted-foreground block mb-1">
                {item.label}
              </Label>
              <p className="text-xl font-bold text-foreground">
                {parseFloat(item.value || "0").toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Scores Summary */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-linear-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <Label className="text-xs text-blue-700 dark:text-blue-300 font-medium uppercase tracking-wider block mb-2">
            CA Total
          </Label>
          <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
            {parseFloat(results?.caTotal || "0").toFixed(2)}
          </p>
        </div>

        <div className="bg-linear-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
          <Label className="text-xs text-purple-700 dark:text-purple-300 font-medium uppercase tracking-wider block mb-2">
            Exam Score
          </Label>
          <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">
            {parseFloat(results?.examScore || "0").toFixed(2)}
          </p>
        </div>

        <div className="bg-linear-to-br from-primary/10 to-primary/20 rounded-lg p-4 border-2 border-primary">
          <Label className="text-xs text-primary font-semibold uppercase tracking-wider block mb-2">
            Total Score
          </Label>
          <p className="text-3xl font-bold text-primary">
            {parseFloat(results?.totalScore || "0").toFixed(2)}
          </p>
        </div>

        <div className="bg-linear-to-br from-accent/10 to-accent/20 rounded-lg p-4 border-2 border-accent">
          <Label className="text-xs text-accent-foreground font-semibold uppercase tracking-wider block mb-2">
            Grade
          </Label>
          <div className="flex items-baseline gap-2">
            <Badge
              variant={getGradeVariant(results?.grade)}
              className="text-xl font-bold px-3 py-1"
            >
              {results?.grade || "N/A"}
            </Badge>
            <span className="text-sm font-medium text-muted-foreground">
              ({parseFloat(results?.gradePoint || "0").toFixed(2)} GP)
            </span>
          </div>
        </div>
      </div>

      {/* Status & Additional Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border border-border rounded-lg p-4 bg-card space-y-3">
          <div>
            <Label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">
              Remark
            </Label>
            <p className="text-sm font-medium text-foreground">
              {results?.remark || "N/A"}
            </p>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground uppercase tracking-wider block mb-2">
              Status
            </Label>
            <Badge
              variant={getStatusVariant(results?.status || "Draft")}
              className="text-sm px-3 py-1"
            >
              {results?.status || "Draft"}
            </Badge>
          </div>
        </div>

        <div className="border border-border rounded-lg p-4 bg-card">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wider block mb-2">
                Carry Over
              </Label>
              <Badge
                variant={results?.isCarryOver ? "destructive" : "secondary"}
                className="text-sm px-3 py-1"
              >
                {results?.isCarryOver ? "Yes" : "No"}
              </Badge>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wider block mb-2">
                Attempt Number
              </Label>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-bold text-primary">
                    {results?.attemptNumber || 1}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {results?.attemptNumber === 1
                    ? "First Attempt"
                    : `Attempt #${results?.attemptNumber}`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
