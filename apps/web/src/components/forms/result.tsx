"use client";

import { useUser } from "@/hooks/auth";
import { orpc, queryClient } from "@/utils/orpc";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { toast } from "sonner";
import z from "zod";
import { useForm } from "@tanstack/react-form";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const resultSchema = z.object({
  id: z.string().uuid().optional(),
  studentId: z.string().uuid("Please select a student"),
  courseId: z.string().uuid("Please select a course"),
  sessionId: z.string().uuid("Please select an academic session"),
  semester: z.string().min(1, "Semester is required"),
  // CA Components
  attendance: z.string().optional(),
  assignment: z.string().optional(),
  test1: z.string().optional(),
  test2: z.string().optional(),
  practical: z.string().optional(),
  caTotal: z.string().optional(), // Auto-calculated
  // Exam
  examScore: z.string().optional(),
  totalScore: z.string().optional(), // Auto-calculated
  grade: z.string().optional(), // Auto-calculated
  gradePoint: z.string().optional(), // Auto-calculated
  remark: z.string().optional(), // Auto-calculated
  // Processing
  uploadedBy: z.string().uuid().optional(),
  status: z.string().default("Draft"),
  // Academic Integrity
  isCarryOver: z.boolean().default(false),
  attemptNumber: z.number().min(1).default(1),
});

type ResultFormValues = z.infer<typeof resultSchema>;

interface ResultFormProps {
  mode: "create" | "update";
  result?: ResultFormValues;
}

export const ResultForm = ({ mode, result }: ResultFormProps) => {
  const { user } = useUser();
  const currentUserId = user?.data?.user.id;

  // Fetching data for select inputs
  const { data: students } = useQuery(orpc.users.getByUserType.queryOptions({ input: { userType: "student" } }));
  const { data: courses } = useQuery(orpc.courses.getAll.queryOptions());
  const { data: academicSessions } = useQuery(orpc.academicSessions.getAll.queryOptions());

  const createMutation = useMutation(
    orpc.results.create.mutationOptions({
      onSuccess: () => {
        toast.success("Result created successfully");
        queryClient.invalidateQueries({
          queryKey: orpc.results.getAll.queryKey(),
        });
        form.reset();
      },
      onError: (err) => toast.error(err.message || "Failed to create result"),
    })
  );

  const updateMutation = useMutation(
    orpc.results.update.mutationOptions({
      onSuccess: () => {
        toast.success("Result updated successfully");
        queryClient.invalidateQueries({
          queryKey: orpc.results.getAll.queryKey(),
        });
      },
      onError: (err) => toast.error(err.message || "Failed to update result"),
    })
  );

  const form = useForm({
    defaultValues: result || {
      studentId: "",
      courseId: "",
      sessionId: "",
      semester: "First",
      attendance: "0",
      assignment: "0",
      test1: "0",
      test2: "0",
      practical: "0",
      caTotal: "0",
      examScore: "0",
      totalScore: "0",
      grade: "",
      gradePoint: "0",
      remark: "",
      status: "Draft",
      isCarryOver: false,
      attemptNumber: 1,
    },
    onSubmit: async ({ value }) => {
      const dataToSubmit = {
        ...value,
        uploadedBy: currentUserId, // Ensure uploadedBy is set
        attendance: value.attendance || "0",
        assignment: value.assignment || "0",
        test1: value.test1 || "0",
        test2: value.test2 || "0",
        practical: value.practical || "0",
        examScore: value.examScore || "0",
      };

      if (mode === "create") {
        await createMutation.mutateAsync(dataToSubmit);
      } else {
        if (!result?.id) throw new Error("Result ID is missing for update");
        await updateMutation.mutateAsync({ ...dataToSubmit, id: result.id });
      }
    },
  });

  const {
    attendance,
    assignment,
    test1,
    test2,
    practical,
    examScore,
  } = form.state.values;

  // Memoize the grade calculation function
  const calculateGradeInfo = useMemo(() => (totalScore: number) => {
    if (totalScore >= 70)
      return { grade: "A", gradePoint: "5.00", remark: "Excellent" };
    if (totalScore >= 60)
      return { grade: "B", gradePoint: "4.00", remark: "Very Good" };
    if (totalScore >= 50)
      return { grade: "C", gradePoint: "3.00", remark: "Good" };
    if (totalScore >= 45)
      return { grade: "D", gradePoint: "2.00", remark: "Fair" };
    if (totalScore >= 40)
      return { grade: "E", gradePoint: "1.00", remark: "Pass" };
    return { grade: "F", gradePoint: "0.00", remark: "Fail" };
  }, []);

  useEffect(() => {
    const ca =
      Number(attendance) +
      Number(assignment) +
      Number(test1) +
      Number(test2) +
      Number(practical);
    const total = ca + Number(examScore);

    const { grade, gradePoint, remark } = calculateGradeInfo(total);

    form.setFieldValue("caTotal", ca.toFixed(2), { dontUpdateIfSame: true });
    form.setFieldValue("totalScore", total.toFixed(2), { dontUpdateIfSame: true });
    form.setFieldValue("grade", grade, { dontUpdateIfSame: true });
    form.setFieldValue("gradePoint", gradePoint, { dontUpdateIfSame: true });
    form.setFieldValue("remark", remark, { dontUpdateIfSame: true });
  }, [
    attendance,
    assignment,
    test1,
    test2,
    practical,
    examScore,
    calculateGradeInfo,
    form,
  ]);

  const statusOptions = useMemo(
    () => ["Draft", "Submitted", "Verified", "Approved", "Published"],
    []
  );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-6 py-4"
    >
      {/* ---------- Student & Course ---------- */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Student & Course Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <form.Field
            name="studentId"
            validators={{ onChange: resultSchema.shape.studentId }}
            children={(field) => (
              <div className="space-y-1">
                <Label>Student *</Label>
                <Select
                  value={field.state.value}
                  onValueChange={field.handleChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students?.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.firstName} {student.lastName} (
                        {student.matricNumber || student.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {field.state.meta.errors && (
                  <p className="text-sm text-red-500">
                    {field.state.meta.errors.join(", ")}
                  </p>
                )}
              </div>
            )}
          />

          <form.Field
            name="courseId"
            validators={{ onChange: resultSchema.shape.courseId }}
            children={(field) => (
              <div className="space-y-1">
                <Label>Course *</Label>
                <Select
                  value={field.state.value}
                  onValueChange={field.handleChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses?.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.courseCode} - {course.courseTitle}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {field.state.meta.errors && (
                  <p className="text-sm text-red-500">
                    {field.state.meta.errors.join(", ")}
                  </p>
                )}
              </div>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <form.Field
            name="sessionId"
            validators={{ onChange: resultSchema.shape.sessionId }}
            children={(field) => (
              <div className="space-y-1">
                <Label>Academic Session *</Label>
                <Select
                  value={field.state.value}
                  onValueChange={field.handleChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select session" />
                  </SelectTrigger>
                  <SelectContent>
                    {academicSessions?.map((session) => (
                      <SelectItem key={session.id} value={session.id}>
                        {session.sessionName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {field.state.meta.errors && (
                  <p className="text-sm text-red-500">
                    {field.state.meta.errors.join(", ")}
                  </p>
                )}
              </div>
            )}
          />

          <form.Field
            name="semester"
            validators={{ onChange: resultSchema.shape.semester }}
            children={(field) => (
              <div className="space-y-1">
                <Label>Semester *</Label>
                <Select
                  value={field.state.value}
                  onValueChange={field.handleChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="First">First</SelectItem>
                    <SelectItem value="Second">Second</SelectItem>
                  </SelectContent>
                </Select>
                {field.state.meta.errors && (
                  <p className="text-sm text-red-500">
                    {field.state.meta.errors.join(", ")}
                  </p>
                )}
              </div>
            )}
          />

          <form.Field
            name="attemptNumber"
            validators={{ onChange: resultSchema.shape.attemptNumber }}
            children={(field) => (
              <div className="space-y-1">
                <Label>Attempt Number *</Label>
                <Input
                  type="number"
                  min="1"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(Number(e.target.value))}
                />
                {field.state.meta.errors && (
                  <p className="text-sm text-red-500">
                    {field.state.meta.errors.join(", ")}
                  </p>
                )}
              </div>
            )}
          />
        </div>

        <form.Field
          name="isCarryOver"
          children={(field) => (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isCarryOver"
                checked={field.state.value}
                onCheckedChange={(checked) => field.handleChange(Boolean(checked))}
              />
              <Label htmlFor="isCarryOver">Carry Over Course</Label>
            </div>
          )}
        />
      </div>

      {/* ---------- Continuous Assessment ---------- */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Continuous Assessment (CA)</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[
            "attendance",
            "assignment",
            "test1",
            "test2",
            "practical",
          ].map((name) => (
            <form.Field
              key={name}
              name={name as keyof ResultFormValues}
              children={(field) => (
                <div className="space-y-1">
                  <Label>
                    {name.charAt(0).toUpperCase() +
                      name.slice(1).replace(/([A-Z])/g, " $1")}{" "}
                    (10%)
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    max="10"
                    step="0.01"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <form.Field
            name="caTotal"
            children={(field) => (
              <div className="space-y-1">
                <Label>CA Total (Auto-calculated)</Label>
                <Input type="number" value={field.state.value} readOnly className="bg-muted" />
              </div>
            )}
          />
          <form.Field
            name="examScore"
            children={(field) => (
              <div className="space-y-1">
                <Label>Exam Score (max 70)</Label>
                <Input
                  type="number"
                  min="0"
                  max="70"
                  step="0.01"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </div>
            )}
          />
        </div>
      </div>

      {/* ---------- Exam & Final Results ---------- */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Examination & Final Results</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <form.Field
            name="totalScore"
            children={(field) => (
              <div className="space-y-1">
                <Label>Total Score (Auto-calculated)</Label>
                <Input type="number" value={field.state.value} readOnly className="bg-muted" />
              </div>
            )}
          />
          <form.Field
            name="grade"
            children={(field) => (
              <div className="space-y-1">
                <Label>Grade (Auto-calculated)</Label>
                <Input value={field.state.value} readOnly className="bg-muted" />
              </div>
            )}
          />
          <form.Field
            name="gradePoint"
            children={(field) => (
              <div className="space-y-1">
                <Label>Grade Point (Auto-calculated)</Label>
                <Input type="number" value={field.state.value} readOnly className="bg-muted" />
              </div>
            )}
          />
          <form.Field
            name="remark"
            children={(field) => (
              <div className="space-y-1 col-span-full">
                <Label>Remark (Auto-calculated)</Label>
                <Input value={field.state.value} readOnly className="bg-muted" />
              </div>
            )}
          />
        </div>
      </div>

      {/* ---------- Processing Status ---------- */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Processing Status</h3>
        <form.Field
          name="status"
          children={(field) => (
            <div className="space-y-1">
              <Label>Status</Label>
              <Select
                value={field.state.value}
                onValueChange={field.handleChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        />
      </div>

      {/* ---------- Actions ---------- */}
      <div className="flex justify-end gap-4 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            form.reset();
          }}
          disabled={createMutation.isPending || updateMutation.isPending}
        >
          Reset
        </Button>
        <Button
          type="submit"
          disabled={createMutation.isPending || updateMutation.isPending}
        >
          {createMutation.isPending || updateMutation.isPending
            ? "Saving..."
            : mode === "create"
            ? "Enter Result"
            : "Update Result"}
        </Button>
      </div>
    </form>
  );
};