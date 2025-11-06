import { orpc, queryClient } from "@/utils/orpc";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import z from "zod";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";
import { useUser } from "@/hooks/auth";
import {
  Upload,
  FileSpreadsheet,
  X,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import Papa from "papaparse";

const attendanceSchema = z.object({
  id: z.string().uuid().optional(),
  studentId: z.string().uuid(),
  courseId: z.string().uuid(),
  sessionId: z.string().uuid(),
  semester: z.enum(["First", "Second"]),
  attendanceDate: z.string(),
  status: z.enum(["Present", "Absent", "Late", "Excused"]),
  markedBy: z.string().uuid(),
  remarks: z.string().optional(),
});

interface AttendanceFormProps {
  mode: "create" | "update";
  attendance?: z.infer<typeof attendanceSchema>;
  onSubmit?: (data: z.infer<typeof attendanceSchema>) => Promise<void>;
}

interface CSVRow {
  matricNumber?: string;
  courseCode?: string;
  session?: string;
  semester?: string;
  date?: string;
  status?: string;
  remarks?: string;
}

export const AttendanceForm = ({
  mode,
  attendance,
  onSubmit,
}: AttendanceFormProps) => {
  const { data: user } = useUser();
  const [csvFile, setCSVFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadResults, setUploadResults] = useState<{
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);

  const createMutation = useMutation(
    orpc.attendance.create.mutationOptions({
      onSuccess: () => {
        toast.success("Attendance record created successfully");
        queryClient.invalidateQueries({
          queryKey: orpc.attendance.create.key(),
        });
      },
      onError: (err) => {
        toast.error(err.message || "An error occurred");
      },
    })
  );
  const updateMutation = useMutation(
    orpc.attendance.update.mutationOptions({
      onSuccess: () => {
        toast.success("Attendance record updated successfully");
        queryClient.invalidateQueries({
          queryKey: orpc.attendance.update.key(),
        });
      },
      onError: (err) => {
        toast.error(err.message || "An error occurred");
      },
    })
  );
  const { data: course, isPending: isCoursePending } = useQuery(
    orpc.courses.getAll.queryOptions()
  );
  const { data: sessions, isPending: isSessionsPending } = useQuery(
    orpc.academicSessions.getAll.queryOptions()
  );

  const { data: students, isPending: isStudentsPending } = useQuery(
    orpc.users.getByUserType.queryOptions({ input: { userType: "student" } })
  );

  const form = useForm({
    defaultValues: attendance || {
      studentId: "",
      courseId: "",
      sessionId: "",
      semester: "First" as const,
      attendanceDate: "",
      status: "Present" as const,
      markedBy: user?.data?.user.id as string,
      remarks: "",
    },
    onSubmit: async ({ value }) => {
      try {
        if (onSubmit) {
          await onSubmit(value);
        } else {
          if (mode === "create") {
            await createMutation.mutateAsync(value);

            form.reset();
          } else {
            await updateMutation.mutateAsync({ ...value, id: `${value.id}` });
          }
        }
      } catch (error: any) {
        toast.error(error.message || "An error occurred");
      }
    },
  });

  useEffect(() => {
    if (mode === "update" && attendance) form.reset(attendance);
  }, [attendance, mode]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "text/csv") {
      setCSVFile(file);
      setUploadResults(null);
    } else {
      toast.error("Please upload a valid CSV file");
    }
  };

  const handleCSVUpload = async () => {
    if (!csvFile || !students || !course || !sessions || !user?.data?.user.id) {
      toast.error("Missing required data");
      return;
    }

    setIsProcessing(true);
    setUploadResults(null);

    Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      complete: async (results) => {
        const rows = results.data as CSVRow[];
        let successCount = 0;
        let failedCount = 0;
        const errors: string[] = [];

        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          try {
            // Trim and normalize all fields
            const matricNumber = row.matricNumber?.trim();
            const courseCode = row.courseCode?.trim();
            const sessionName = row.session?.trim();
            const semesterValue = row.semester?.trim();
            const dateValue = row.date?.trim();
            const statusValue = row.status?.trim();

            // Find student by matric number
            const student = students.find(
              (s) =>
                s.matricNumber?.trim().toLowerCase() ===
                matricNumber?.toLowerCase()
            );
            if (!student) {
              throw new Error(`Student not found: ${matricNumber}`);
            }

            // Find course by course code
            const courseItem = course.find(
              (c) =>
                c.courseCode?.trim().toLowerCase() === courseCode?.toLowerCase()
            );
            if (!courseItem) {
              throw new Error(`Course not found: ${courseCode}`);
            }

            // Find session by session name
            const session = sessions.find(
              (s) =>
                s.sessionName?.trim().toLowerCase() ===
                sessionName?.toLowerCase()
            );
            if (!session) {
              throw new Error(`Session not found: ${sessionName}`);
            }

            // Validate semester
            const semester = semesterValue as "First" | "Second";
            if (!["First", "Second"].includes(semester)) {
              throw new Error(`Invalid semester: ${semesterValue}`);
            }

            // Validate status
            const status = statusValue as
              | "Present"
              | "Absent"
              | "Late"
              | "Excused";
            if (!["Present", "Absent", "Late", "Excused"].includes(status)) {
              throw new Error(`Invalid status: ${statusValue}`);
            }

            // Parse date
            const attendanceDate = new Date(dateValue || "");
            if (isNaN(attendanceDate.getTime())) {
              throw new Error(`Invalid date: ${dateValue}`);
            }

            // Create attendance record
            await createMutation.mutateAsync({
              studentId: student.id,
              courseId: courseItem.id,
              sessionId: session.id,
              semester,
              attendanceDate: attendanceDate.toISOString(),
              status,
              markedBy: user?.data?.user.id as string,
              remarks: row.remarks?.trim() || "",
            });

            successCount++;
          } catch (error: any) {
            failedCount++;
            errors.push(`Row ${i + 2}: ${error.message}`);
          }
        }

        setUploadResults({
          success: successCount,
          failed: failedCount,
          errors,
        });
        setIsProcessing(false);

        if (successCount > 0) {
          toast.success(
            `Successfully uploaded ${successCount} attendance records`
          );
        }
        if (failedCount > 0) {
          toast.error(`Failed to upload ${failedCount} records`);
        }
      },
      error: (error) => {
        setIsProcessing(false);
        toast.error(`CSV parsing error: ${error.message}`);
      },
    });
  };

  const downloadTemplate = () => {
    const template = `matricNumber,courseCode,session,semester,date,status,remarks
ST001,CS101,2024/2025,First,2025-01-15,Present,
ST002,CS101,2024/2025,First,2025-01-15,Absent,Medical excuse`;

    const blob = new Blob([template], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "attendance_template.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const semesters = ["First", "Second"] as const;
  const statusOptions = ["Present", "Absent", "Late", "Excused"] as const;

  return (
    <Card className="max-w-3xl mx-auto mt-10">
      <CardHeader>
        <CardTitle>
          {mode === "create" ? "Mark Attendance" : "Update Attendance"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {mode === "create" && (
          <div className="bg-linear-to-r from-blue-50 to-indigo-50 border-2 border-dashed border-blue-200 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="bg-primary p-3 rounded-lg">
                <FileSpreadsheet className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Bulk Upload via CSV
                  </h3>
                  <p className="text-sm text-gray-600">
                    Upload multiple attendance records at once using a CSV file
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={downloadTemplate}
                    className="gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Download Template
                  </Button>

                  <label htmlFor="csv-upload">
                    <Button
                      type="button"
                      variant="default"
                      size="sm"
                      className="gap-2"
                      asChild
                    >
                      <span>
                        <Upload className="w-4 h-4" />
                        {csvFile ? "Change File" : "Select CSV File"}
                      </span>
                    </Button>
                  </label>
                  <input
                    id="csv-upload"
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {csvFile && (
                    <Button
                      type="button"
                      onClick={handleCSVUpload}
                      disabled={isProcessing}
                      size="sm"
                      className="gap-2"
                    >
                      {isProcessing ? "Processing..." : "Upload CSV"}
                    </Button>
                  )}
                </div>

                {csvFile && (
                  <div className="flex items-center gap-2 bg-white p-3 rounded border">
                    <FileSpreadsheet className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium flex-1">
                      {csvFile.name}
                    </span>
                    <button
                      title="csv"
                      onClick={() => {
                        setCSVFile(null);
                        setUploadResults(null);
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {uploadResults && (
                  <div className="space-y-2">
                    <div className="flex gap-4">
                      {uploadResults.success > 0 && (
                        <div className="flex items-center gap-2 text-green-700 bg-green-50 px-3 py-2 rounded">
                          <CheckCircle2 className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            {uploadResults.success} successful
                          </span>
                        </div>
                      )}
                      {uploadResults.failed > 0 && (
                        <div className="flex items-center gap-2 text-red-700 bg-red-50 px-3 py-2 rounded">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            {uploadResults.failed} failed
                          </span>
                        </div>
                      )}
                    </div>
                    {uploadResults.errors.length > 0 && (
                      <details className="text-xs bg-red-50 p-3 rounded border border-red-200">
                        <summary className="cursor-pointer font-medium text-red-900">
                          View Errors ({uploadResults.errors.length})
                        </summary>
                        <ul className="mt-2 space-y-1 text-red-700">
                          {uploadResults.errors.map((error, idx) => (
                            <li key={idx}>{error}</li>
                          ))}
                        </ul>
                      </details>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-500">
              Or enter manually
            </span>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="space-y-6"
        >
          <div className="grid grid-cols-2 gap-4">
            <form.Field
              name="studentId"
              validators={{ onChange: attendanceSchema.shape.studentId }}
            >
              {(field) => (
                <div className="space-y-2">
                  <Label>Matric/ADM No. *</Label>
                  <Select
                    disabled={isStudentsPending}
                    value={field.state.value}
                    onValueChange={(e) => field.handleChange(e)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a student" />
                    </SelectTrigger>
                    <SelectContent>
                      {students?.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.matricNumber}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </form.Field>
            <form.Field
              name="courseId"
              validators={{ onChange: attendanceSchema.shape.courseId }}
            >
              {(field) => (
                <div className="space-y-2">
                  <Label>Course Code *</Label>
                  <Select
                    disabled={isCoursePending}
                    value={field.state.value}
                    onValueChange={(e) => field.handleChange(e)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a course" />
                    </SelectTrigger>
                    <SelectContent>
                      {course?.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.courseCode}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </form.Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <form.Field
              name="sessionId"
              validators={{ onChange: attendanceSchema.shape.sessionId }}
            >
              {(field) => (
                <div className="space-y-2">
                  <Label>Session*</Label>
                  <Select
                    disabled={isSessionsPending}
                    value={field.state.value}
                    onValueChange={(e) => field.handleChange(e)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a session" />
                    </SelectTrigger>
                    <SelectContent>
                      {sessions?.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.sessionName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </form.Field>
            <form.Field name="semester">
              {(field) => (
                <div className="space-y-2">
                  <Label>Semester *</Label>
                  <Select
                    value={field.state.value}
                    onValueChange={(e) =>
                      field.handleChange(e as "First" | "Second")
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select semester" />
                    </SelectTrigger>

                    <SelectContent>
                      {semesters.map((sem) => (
                        <SelectItem key={sem} value={sem}>
                          {sem}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </form.Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <form.Field name="attendanceDate">
              {(field) => (
                <div className="space-y-2">
                  <Label>Date *</Label>
                  <Input
                    type="date"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>
            <form.Field name="status">
              {(field) => (
                <div className="space-y-2">
                  <Label>Status *</Label>
                  <Select
                    value={field.state.value}
                    onValueChange={(e) =>
                      field.handleChange(
                        e as "Present" | "Absent" | "Late" | "Excused"
                      )
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </form.Field>
          </div>

          <form.Field name="remarks">
            {(field) => (
              <div className="space-y-2">
                <Label>Remarks</Label>
                <Textarea
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  rows={3}
                />
              </div>
            )}
          </form.Field>
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
            >
              {mode === "create" ? "Clear Form" : "Cancel"}
            </Button>
            <Button type="submit">
              {mode === "create" ? "Mark Attendance" : "Update Attendance"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
