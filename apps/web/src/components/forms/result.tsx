"use client";

import { useUser } from "@/hooks/auth";
import { orpc, queryClient } from "@/utils/orpc";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useRef, useMemo, useCallback } from "react"; // Added useCallback and useMemo
import { toast } from "sonner";
import z from "zod";
import { useAppForm } from "../form";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
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
// Removed useStore from @tanstack/react-form

const resultSchema = z.object({
  id: z.string().uuid().optional(),
  studentId: z.string().uuid(),
  courseId: z.string().uuid(),
  sessionId: z.string().uuid(),
  semester: z.string(),
  // CA Components
  attendance: z.string().optional(),
  assignment: z.string().optional(),
  test1: z.string().optional(),
  test2: z.string().optional(),
  practical: z.string().optional(),
  caTotal: z.string().optional(),
  // Exam
  examScore: z.string(),
  totalScore: z.string(),
  grade: z.string(),
  gradePoint: z.string(),
  remark: z.string().optional(),
  // Processing
  uploadedBy: z.string().uuid().optional(),
  uploadedAt: z.date().optional(),
  verifiedBy: z.string().uuid().optional(),
  verifiedAt: z.date().optional(),
  approvedBy: z.string().uuid().optional(),
  approvedAt: z.date().optional(),
  status: z.string().default("Draft"),
  // Academic Integrity
  isCarryOver: z.boolean().default(false),
  attemptNumber: z.number().default(1),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

interface ResultFormProps {
  mode: "create" | "update";
  result?: z.infer<typeof resultSchema>;
  onSubmit?: (data: z.infer<typeof resultSchema>) => Promise<void>;
  onClose?: () => void; // Added for dialog close
}

export const ResultForm = ({
  mode,
  result,
  onSubmit,
  onClose,
}: ResultFormProps) => {
  const { data: user } = useUser();
  const userId = user?.data?.user.id;

  const createMutation = useMutation(
    orpc.results.create.mutationOptions({
      onSuccess: () => {
        toast.success("Result created successfully");
        form.reset();
        queryClient.invalidateQueries({ queryKey: ["results"] });
        onClose?.(); // Close dialog on success
      },
      onError: (err) => toast.error(err.message),
    })
  );

  const updateMutation = useMutation(
    orpc.results.update.mutationOptions({
      onSuccess: () => {
        toast.success("Result updated successfully");
        queryClient.invalidateQueries({ queryKey: orpc.results.update.key() });
        onClose?.(); // Close dialog on success
      },
      onError: (err) => toast.error(err.message),
    })
  );

  const getDefaultValues = useCallback(() => {
    return {
      ...(result ?? {}),
      studentId: result?.studentId ?? "",
      courseId: result?.courseId ?? "",
      sessionId: result?.sessionId ?? "",
      semester: result?.semester ?? "First",
      attendance: result?.attendance ?? "0",
      assignment: result?.assignment ?? "0",
      test1: result?.test1 ?? "0",
      test2: result?.test2 ?? "0",
      practical: result?.practical ?? "0",
      caTotal: result?.caTotal ?? "0", // Will be overwritten by calculation
      examScore: result?.examScore ?? "0",
      totalScore: result?.totalScore ?? "0", // Will be overwritten by calculation
      grade: result?.grade ?? "", // Will be overwritten by calculation
      gradePoint: result?.gradePoint ?? "0", // Will be overwritten by calculation
      remark: result?.remark ?? "", // Will be overwritten by calculation
      uploadedBy: result?.uploadedBy ?? userId ?? "",
      status: result?.status ?? "Draft",
      isCarryOver: result?.isCarryOver ?? false,
      attemptNumber: result?.attemptNumber ?? 1,
    };
  }, [result, userId]);

  const form = useAppForm({
    defaultValues: getDefaultValues(), // Initialize with default values
    onSubmit: async ({ value }) => {
      if (onSubmit) {
        await onSubmit(value);
        return;
      }

      if (mode === "create") {
        await createMutation.mutateAsync(value);
      } else {
        await updateMutation.mutateAsync({ ...value, id: result?.id ?? "" });
      }
    },
  });

  // Effect for setting uploadedBy on create
  useEffect(() => {
    if (mode === "create" && userId && !form.getFieldValue("uploadedBy")) {
      form.setFieldValue("uploadedBy", userId); // Added dontUpdateIfSame
    }
  }, [mode, userId, form]);

  // Use a debounced effect for calculations to reduce re-renders
  const currentFormValues = {
    attendance: form.state.values.attendance,
    assignment: form.state.values.assignment,
    test1: form.state.values.test1,
    test2: form.state.values.test2,
    practical: form.state.values.practical,
    examScore: form.state.values.examScore,
  };

  // Memoize the calculation function
  const calculateGradeInfo = useCallback((score: number) => {
    if (score >= 70)
      return { grade: "A", gradePoint: "5.00", remark: "Excellent" };
    if (score >= 60)
      return { grade: "B", gradePoint: "4.00", remark: "Very Good" };
    if (score >= 50) return { grade: "C", gradePoint: "3.00", remark: "Good" };
    if (score >= 45) return { grade: "D", gradePoint: "2.00", remark: "Fair" };
    if (score >= 40) return { grade: "E", gradePoint: "1.00", remark: "Pass" };
    return { grade: "F", gradePoint: "0.00", remark: "Fail" };
  }, []);

  // Use a single useEffect with debounce for all calculated fields
  useEffect(() => {
    const handler = setTimeout(() => {
      const ca =
        Number(currentFormValues.attendance ?? 0) +
        Number(currentFormValues.assignment ?? 0) +
        Number(currentFormValues.test1 ?? 0) +
        Number(currentFormValues.test2 ?? 0) +
        Number(currentFormValues.practical ?? 0);

      const exam = Number(currentFormValues.examScore ?? 0);
      const total = ca + exam;
      const { grade, gradePoint, remark } = calculateGradeInfo(total);

      // Batch updates where possible, and use dontUpdateIfSame to prevent unnecessary re-renders
      form.setFieldValue("caTotal", ca.toFixed(2));
      form.setFieldValue("totalScore", total.toFixed(2));
      form.setFieldValue("grade", grade);
      form.setFieldValue("gradePoint", gradePoint);
      form.setFieldValue("remark", remark);
    }, 300); // Debounce by 300ms

    return () => {
      clearTimeout(handler);
    };
  }, [
    currentFormValues.attendance,
    currentFormValues.assignment,
    currentFormValues.test1,
    currentFormValues.test2,
    currentFormValues.practical,
    currentFormValues.examScore,
    calculateGradeInfo,
    form,
  ]);

  const prevResultRef = useRef(result);
  useEffect(() => {
    if (mode === "update" && result && prevResultRef.current !== result) {
      if (!form.state.isDirty) {
        form.reset(getDefaultValues()); // Reset with the new default values
      }
      prevResultRef.current = result;
    }
  }, [mode, result, form, getDefaultValues]); // Added form and getDefaultValues to deps

  const statusOptions = useMemo(
    () => ["Draft", "Submitted", "Verified", "Approved", "Published"],
    []
  );

  return (
    <Card className="mx-auto mt-10">
      <CardHeader>
        <CardTitle>
          {mode === "create" ? "Enter Result" : "Update Result"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="space-y-6"
        >
          {/* ---------- Student & Course ---------- */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Student Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <form.AppField
                name="studentId"
                validators={{ onChange: resultSchema.shape.studentId }}
              >
                {(field) => <field.StudentField />}
              </form.AppField>

              <form.AppField
                name="courseId"
                validators={{ onChange: resultSchema.shape.courseId }}
              >
                {(field) => <field.CourseField />}
              </form.AppField>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <form.AppField
                name="sessionId"
                validators={{ onChange: resultSchema.shape.sessionId }}
              >
                {(field) => <field.AcademicSessionField />}
              </form.AppField>

              <form.AppField name="semester">
                {(field) => <field.SemesterField />}
              </form.AppField>

              <form.AppField
                name="attemptNumber"
                validators={{ onChange: z.number().min(1) }}
              >
                {(field) => (
                  <div className="space-y-2">
                    <Label>Attempt Number</Label>
                    <Input
                      type="number"
                      min="1"
                      value={field.state.value}
                      onChange={(e) =>
                        field.handleChange(Number(e.target.value))
                      }
                      onBlur={field.handleBlur} // Add onBlur
                    />
                  </div>
                )}
              </form.AppField>
            </div>

            <form.Field name="isCarryOver">
              {(field) => (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isCarryOver"
                    checked={field.state.value}
                    onCheckedChange={(c) => field.handleChange(!!c)}
                    onBlur={field.handleBlur} // Add onBlur
                  />
                  <Label htmlFor="isCarryOver" className="cursor-pointer">
                    Carry Over Course
                  </Label>
                </div>
              )}
            </form.Field>
          </div>

          {/* ---------- Continuous Assessment ---------- */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              Continuous Assessment (CA)
            </h3>
            <div className="grid grid-cols-5 gap-4">
              {["attendance", "assignment", "test1", "test2", "practical"].map(
                (name) => (
                  <form.Field key={name} name={name as any}>
                    {(field) => (
                      <div className="space-y-2">
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
                          onBlur={field.handleBlur} // Add onBlur
                        />
                      </div>
                    )}
                  </form.Field>
                )
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <form.Field name="caTotal">
                {(field) => (
                  <div className="space-y-2">
                    <Label>CA Total (Auto-calculated)</Label>
                    <Input
                      type="number"
                      value={field.state.value}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                )}
              </form.Field>
            </div>
          </div>

          {/* ---------- Exam & Final Results ---------- */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              Examination & Final Results
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <form.Field name="examScore">
                {(field) => (
                  <div className="space-y-2">
                    <Label>Exam Score (max 70)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="70"
                      step="0.01"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur} // Add onBlur
                    />
                  </div>
                )}
              </form.Field>

              <form.Field name="totalScore">
                {(field) => (
                  <div className="space-y-2">
                    <Label>Total Score (Auto-calculated)</Label>
                    <Input
                      type="number"
                      value={field.state.value}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                )}
              </form.Field>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {["grade", "gradePoint", "remark"].map((name) => (
                <form.Field key={name} name={name as any}>
                  {(field) => (
                    <div className="space-y-2">
                      <Label>
                        {name.charAt(0).toUpperCase() +
                          name.slice(1).replace(/([A-Z])/g, " $1")}{" "}
                        (Auto-calculated)
                      </Label>
                      <Input
                        value={field.state.value}
                        readOnly
                        className="bg-muted"
                      />
                    </div>
                  )}
                </form.Field>
              ))}
            </div>
          </div>

          {/* ---------- Processing Status ---------- */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Processing Status</h3>
            <form.Field name="status">
              {(field) => (
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={field.state.value}
                    onValueChange={field.handleChange}
                    onOpenChange={(open) => {
                      if (!open) field.handleBlur(); // Trigger blur when select closes
                    }}
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
            </form.Field>
          </div>

          {/* ---------- Actions ---------- */}
          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                form.reset();
              }}
            >
              {mode === "create" ? "Clear Form" : "Cancel"}
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
      </CardContent>
    </Card>
  );
};
