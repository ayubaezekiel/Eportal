import type { User as UserTypes } from "@/types/types";
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
  AlertCircle,
  Building,
  CheckCircle,
  Clock,
  CreditCard,
  Eye,
  FileText,
  GraduationCap,
  Mail,
  Trash,
  User,
} from "lucide-react";
import { useState } from "react";
import { UpdateUserForm } from "../forms/update-user";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { View } from "../view";
import { toast } from "sonner";

function UserDetailsDialog({
  user,
  open,
  onOpenChange,
}: {
  user: UserTypes;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  // Fetch related data for the user
  const { data: payments } = useQuery({
    ...orpc.payments.getByStudent.queryOptions({
      input: { studentId: user.id },
    }),
    enabled: user.userType === "student",
  });

  const { data: courseRegistrations } = useQuery({
    ...orpc.courseRegistrations.getByStudent.queryOptions({
      input: { studentId: user.id },
    }),
    enabled: user.userType === "student",
  });

  const { data: results } = useQuery({
    ...orpc.results.getByStudent.queryOptions({
      input: { studentId: user.id },
    }),
    enabled: user.userType === "student",
  });

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-NG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {user.firstName} {user.middleName} {user.lastName}
          </DialogTitle>
          <DialogDescription>
            Complete user information and activity history
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="personal">Personal</TabsTrigger>
            <TabsTrigger value="academic">Academic</TabsTrigger>
            {user.userType === "student" && (
              <>
                <TabsTrigger value="payments">Payments</TabsTrigger>
                <TabsTrigger value="results">Results</TabsTrigger>
              </>
            )}
            <TabsTrigger value="status">Status</TabsTrigger>
          </TabsList>

          {/* Personal Information Tab */}
          <TabsContent value="personal" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Full Name
                  </label>
                  <p className="text-sm">
                    {user.firstName} {user.middleName} {user.lastName}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Gender
                  </label>
                  <p className="text-sm capitalize">{user.gender}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Date of Birth
                  </label>
                  <p className="text-sm">{formatDate(user.dateOfBirth)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Nationality
                  </label>
                  <p className="text-sm">{user.nationality}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    State of Origin
                  </label>
                  <p className="text-sm">{user.stateOfOrigin}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    LGA of Origin
                  </label>
                  <p className="text-sm">{user.lgaOfOrigin}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Email
                  </label>
                  <p className="text-sm">{user.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Phone Number
                  </label>
                  <p className="text-sm">{user.phoneNumber}</p>
                </div>
                {user.alternatePhone && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Alternate Phone
                    </label>
                    <p className="text-sm">{user.alternatePhone}</p>
                  </div>
                )}
                <div className="col-span-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Permanent Address
                  </label>
                  <p className="text-sm">{user.permanentAddress}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Contact Address
                  </label>
                  <p className="text-sm">{user.contactAddress}</p>
                </div>
              </CardContent>
            </Card>

            {user.nextOfKinName && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Emergency Contact
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Next of Kin Name
                    </label>
                    <p className="text-sm">{user.nextOfKinName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Relationship
                    </label>
                    <p className="text-sm">{user.nextOfKinRelationship}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Phone Number
                    </label>
                    <p className="text-sm">{user.nextOfKinPhone}</p>
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Address
                    </label>
                    <p className="text-sm">{user.nextOfKinAddress}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Academic Information Tab */}
          <TabsContent value="academic" className="space-y-4">
            {user.userType === "student" ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" />
                      Student Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Matric Number
                      </label>
                      <p className="text-sm font-mono">{user.matricNumber}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        JAMB Registration Number
                      </label>
                      <p className="text-sm font-mono">{user.jambRegNumber}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Mode of Entry
                      </label>
                      <p className="text-sm">{user.modeOfEntry}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Admission Year
                      </label>
                      <p className="text-sm">{user.admissionYear}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Current Level
                      </label>
                      <p className="text-sm">{user.currentLevel} Level</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Current Semester
                      </label>
                      <p className="text-sm">{user.currentSemester}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Study Mode
                      </label>
                      <p className="text-sm">{user.studyMode}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        CGPA
                      </label>
                      <p className="text-sm font-semibold">
                        {user.cgpa || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Total Credits Earned
                      </label>
                      <p className="text-sm">{user.totalCreditsEarned || 0}</p>
                    </div>
                  </CardContent>
                </Card>

                {courseRegistrations && courseRegistrations.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Recent Course Registrations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {courseRegistrations.slice(0, 5).map((reg) => (
                          <div
                            key={reg.id}
                            className="flex items-center justify-between p-2 border rounded"
                          >
                            <div>
                              <p className="text-sm font-medium">
                                {reg.semester} Semester - {reg.registrationType}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatDate(`${reg.registrationDate}`)}
                              </p>
                            </div>
                            <Badge
                              variant={
                                reg.status === "Approved"
                                  ? "default"
                                  : reg.status === "Pending"
                                  ? "secondary"
                                  : "destructive"
                              }
                            >
                              {reg.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Staff Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Staff ID
                    </label>
                    <p className="text-sm font-mono">{user.staffId}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Designation
                    </label>
                    <p className="text-sm">{user.designation}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Employment Date
                    </label>
                    <p className="text-sm">
                      {user.employmentDate
                        ? formatDate(user.employmentDate)
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Employment Type
                    </label>
                    <p className="text-sm">{user.employmentType}</p>
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Office Location
                    </label>
                    <p className="text-sm">{user.officeLocation}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Payments Tab (Students only) */}
          {user.userType === "student" && (
            <TabsContent value="payments" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Payment History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {payments && payments.length > 0 ? (
                    <div className="space-y-3">
                      {payments.map((payment) => (
                        <div
                          key={payment.id}
                          className="flex items-center justify-between p-3 border rounded"
                        >
                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              {payment.paymentType}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Ref: {payment.referenceNumber}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(`${payment.paymentDate}`)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold">
                              {formatCurrency(Number(payment.amount))}
                            </p>
                            <Badge
                              variant={
                                payment.status === "Confirmed"
                                  ? "default"
                                  : payment.status === "Pending"
                                  ? "secondary"
                                  : "destructive"
                              }
                            >
                              {payment.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      <CreditCard className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No payment records found</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Results Tab (Students only) */}
          {user.userType === "student" && (
            <TabsContent value="results" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Academic Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {results && results.length > 0 ? (
                    <div className="space-y-3">
                      {results.slice(0, 10).map((result) => (
                        <div
                          key={result.id}
                          className="flex items-center justify-between p-3 border rounded"
                        >
                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              {result.semester} Semester
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {result.isCarryOver && (
                                <span className="text-orange-500">
                                  Carry Over •{" "}
                                </span>
                              )}
                              Attempt {result.attemptNumber}
                            </p>
                          </div>
                          <div className="text-right space-x-2">
                            <span className="text-sm font-semibold">
                              {result.totalScore}%
                            </span>
                            <Badge
                              variant={
                                result.grade === "A" || result.grade === "B"
                                  ? "default"
                                  : result.grade === "F"
                                  ? "destructive"
                                  : "secondary"
                              }
                            >
                              {result.grade}
                            </Badge>
                            <Badge variant="outline">{result.status}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No results found</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Status Tab */}
          <TabsContent value="status" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Account Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      User Type
                    </label>
                    <Badge variant="outline" className="mt-1">
                      {user.userType}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Status
                    </label>
                    <Badge
                      variant={
                        user.status === "active" ? "default" : "secondary"
                      }
                      className="mt-1"
                    >
                      {user.status}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Account Created
                    </label>
                    <p className="text-sm">{formatDate(`${user.createdAt}`)}</p>
                  </div>
                  {user.lastLogin && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Last Login
                      </label>
                      <p className="text-sm">
                        {formatDate(`${user.lastLogin}`)}
                      </p>
                    </div>
                  )}
                </div>

                {user.isOnProbation && (
                  <div className="p-4 border border-orange-500 rounded bg-orange-50">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="h-4 w-4 text-orange-500" />
                      <span className="font-medium text-orange-700">
                        On Probation
                      </span>
                    </div>
                    <p className="text-sm text-orange-600">
                      {user.probationReason}
                    </p>
                  </div>
                )}

                {user.isDeferred && (
                  <div className="p-4 border border-blue-500 rounded bg-blue-50">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-blue-500" />
                      <span className="font-medium text-blue-700">
                        Deferred
                      </span>
                    </div>
                    <p className="text-sm text-blue-600">
                      {user.defermentStartDate &&
                        `From ${formatDate(user.defermentStartDate)}`}
                      {user.defermentEndDate &&
                        ` to ${formatDate(user.defermentEndDate)}`}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

export function UsersTable({ userType }: { userType: "all" | "student" }) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [selectedUser, setSelectedUser] = useState<UserTypes | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data, isPending, refetch } = useQuery(
    userType === "student"
      ? orpc.users.getByUserType.queryOptions({
          input: { userType: "student" },
        })
      : orpc.users.getAll.queryOptions()
  );

  const deleteUser = useMutation(
    orpc.users.delete.mutationOptions({
      onSuccess: () => {
        toast.success("User deleted successsfully");
        refetch();
      },
      onError: (err) => {
        toast.error(err.message);
      },
    })
  );

  const columns: ColumnDef<UserTypes>[] = [
    {
      accessorKey: "firstName",
      header: "Name",
      cell: ({ row }) => `${row.original.firstName} ${row.original.lastName}`,
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "userType",
      header: "Type",
      cell: ({ getValue }) => (
        <Badge variant="outline">{getValue() as string}</Badge>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ getValue }) => (
        <Badge variant={getValue() === "active" ? "default" : "secondary"}>
          {getValue() as string}
        </Badge>
      ),
    },
    {
      accessorKey: "phoneNumber",
      header: "Phone",
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            variant={"secondary"}
            size="icon-sm"
            onClick={() => {
              setSelectedUser(row.original);
              setDialogOpen(true);
            }}
          >
            <Eye />
          </Button>
          <UpdateUserForm user={row.original} />

          <Button
            variant={"destructive"}
            size="icon-sm"
            onClick={async () => {
              toast.success("Are you sure you want to delete this user?", {
                action: (
                  <Button
                    size={"sm"}
                    variant={"destructive"}
                    onClick={async () => {
                      await deleteUser.mutateAsync({ id: row.original.id });
                    }}
                  >
                    Delete
                  </Button>
                ),
                cancel: "Cancelled!!!",
              });
            }}
          >
            <Trash />
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
      <div className="flex items-center py-4 gap-4">
        <Input
          placeholder="Filter by name..."
          value={
            (table.getColumn("firstName")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn("firstName")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <Select
          value={
            (table.getColumn("userType")?.getFilterValue() as string) ?? ""
          }
          onValueChange={(value) =>
            table
              .getColumn("userType")
              ?.setFilterValue(value === "all" ? "" : value)
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="student">Student</SelectItem>
            <SelectItem value="lecturer">Lecturer</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
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
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
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

      {selectedUser && (
        <UserDetailsDialog
          user={selectedUser}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
        />
      )}
    </View>
  );
}
