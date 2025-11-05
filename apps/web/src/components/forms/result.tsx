import { orpc } from "@/utils/orpc";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";
import z from "zod";
import { useAppForm } from "../form";
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

const resultSchema = z.object({
  id: z.string().uuid().optional(),
  studentId: z.string().uuid(),
  courseId: z.string().uuid(),
  sessionId: z.string().uuid(),
  semester: z.enum(["First", "Second"]),
  caScore: z.number().min(0).max(30).optional(),
  examScore: z.string(),
  totalScore: z.string(),
  grade: z.string().max(2),
  gradePoint: z.string(),
  creditUnits: z.number().min(1).max(6),
  qualityPoints: z.number().min(0),
  status: z.enum(["Pass", "Fail", "Incomplete", "Withdrawn"]).default("Pass"),
  remarks: z.string().optional(),
  enteredBy: z.string().uuid(),
  approvedBy: z.string().uuid().optional(),
});

interface ResultFormProps {
  mode: "create" | "update";
  result?: z.infer<typeof resultSchema>;
  onSubmit?: (data: z.infer<typeof resultSchema>) => Promise<void>;
}

export const ResultForm = ({ mode, result, onSubmit }: ResultFormProps) => {
  const createMutation = useMutation(orpc.results.create.mutationOptions());
  const updateMutation = useMutation(orpc.results.update.mutationOptions());
  const { data: user } = useUser();
  const form = useAppForm({
    defaultValues: result || {
      studentId: "",
      courseId: "",
      sessionId: "",
      semester: "First" as const,
      caScore: 0,
      examScore: "0",
      totalScore: "0",
      grade: "",
      gradePoint: "0",
      creditUnits: 3,
      qualityPoints: 0,
      status: "Pass" as const,
      remarks: "",
      enteredBy: `${user?.data?.user.id}`,
      approvedBy: "",
    },
    onSubmit: async ({ value }) => {
      try {
        if (onSubmit) {
          await onSubmit(value);
        } else {
          if (mode === "create") {
            await createMutation.mutateAsync(value);
            toast.success("Record created successfully");
            form.reset();
          } else {
            await updateMutation.mutateAsync({ ...value, id: `${result?.id}` });
            toast.success("Record updated successfully");
          }
        }
      } catch (error: any) {
        toast.error(error.message || "An error occurred");
      }
    },
  });

  useEffect(() => {
    if (mode === "update" && result) form.reset(result);
  }, [result, mode]);

  const statusOptions = ["Pass", "Fail", "Incomplete", "Withdrawn"];

  return (
    <Card className="max-w-3xl mx-auto mt-10">
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
          <div className="grid grid-cols-2 gap-4">
            <form.AppField
              name="sessionId"
              validators={{ onChange: resultSchema.shape.sessionId }}
            >
              {(field) => <field.AcademicSessionField />}
            </form.AppField>
            <form.AppField name="semester">
              {(field) => <field.SemesterField />}
            </form.AppField>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <form.Field name="caScore">
              {(field) => (
                <div className="space-y-2">
                  <Label>CA Score (0-30)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="30"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(Number(e.target.value))}
                  />
                </div>
              )}
            </form.Field>
            <form.Field name="examScore">
              {(field) => (
                <div className="space-y-2">
                  <Label>Exam Score (0-70)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="70"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>
            <form.Field
              name="totalScore"
              validators={{ onChange: resultSchema.shape.totalScore }}
            >
              {(field) => (
                <div className="space-y-2">
                  <Label>Total Score *</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <form.Field
              name="grade"
              validators={{ onChange: resultSchema.shape.grade }}
            >
              {(field) => (
                <div className="space-y-2">
                  <Label>Grade *</Label>
                  <Input
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    maxLength={2}
                  />
                </div>
              )}
            </form.Field>
            <form.Field
              name="gradePoint"
              validators={{ onChange: resultSchema.shape.gradePoint }}
            >
              {(field) => (
                <div className="space-y-2">
                  <Label>Grade Point *</Label>
                  <Input
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>
            <form.Field
              name="creditUnits"
              validators={{ onChange: resultSchema.shape.creditUnits }}
            >
              {(field) => (
                <div className="space-y-2">
                  <Label>Credit Units *</Label>
                  <Input
                    type="number"
                    min="1"
                    max="6"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(Number(e.target.value))}
                  />
                </div>
              )}
            </form.Field>
          </div>
          <form.Field name="status">
            {(field) => (
              <div className="space-y-2">
                <Label>Status *</Label>
                <Select
                  value={field.state.value}
                  onValueChange={(e) =>
                    field.handleChange(
                      e as "Pass" | "Fail" | "Incomplete" | "Withdrawn"
                    )
                  }
                >
                  <SelectTrigger>
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
              {mode === "create" ? "Enter Result" : "Update Result"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
