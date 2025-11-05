import { orpc } from "@/utils/orpc";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
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
import { Checkbox } from "../ui/checkbox";

const courseAllocationSchema = z.object({
  id: z.string().uuid().optional(),
  courseId: z.string().uuid(),
  lecturerId: z.string().uuid(),
  sessionId: z.string().uuid(),
  semester: z.enum(["First", "Second"]),
  role: z
    .enum(["Lecturer", "Co-Lecturer", "Lab Assistant"])
    .default("Lecturer"),
  isActive: z.boolean().default(true),
});

interface CourseAllocationFormProps {
  mode: "create" | "update";
  courseAllocation?: z.infer<typeof courseAllocationSchema>;
  onSubmit?: (data: z.infer<typeof courseAllocationSchema>) => Promise<void>;
}

export const CourseAllocationForm = ({
  mode,
  courseAllocation,
  onSubmit,
}: CourseAllocationFormProps) => {
  const createMutation = useMutation(orpc.courseAllocation.create.mutationOptions());
  const updateMutation = useMutation(orpc.courseAllocation.update.mutationOptions());
  const form = useForm({
    defaultValues: courseAllocation || {
      courseId: "",
      lecturerId: "",
      sessionId: "",
      semester: "First" as const,
      role: "Lecturer" as const,
      isActive: true,
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
            await updateMutation.mutateAsync(value);
            toast.success("Record updated successfully");
          }
        }
      } catch (error: any) {
        toast.error(error.message || "An error occurred");
      }
    },
  });

  useEffect(() => {
    if (mode === "update" && courseAllocation) form.reset(courseAllocation);
  }, [courseAllocation, mode]);

  const semesters = ["First", "Second"];
  const roles = ["Lecturer", "Co-Lecturer", "Lab Assistant"];

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>
          {mode === "create" ? "Assign Course" : "Update Course Assignment"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit(); }} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <form.Field
              name="courseId"
              validators={{ onChange: courseAllocationSchema.shape.courseId }}
            >
              {(field) => (
                <div className="space-y-2">
                  <Label>Course ID *</Label>
                  <Input
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>
            <form.Field
              name="lecturerId"
              validators={{ onChange: courseAllocationSchema.shape.lecturerId }}
            >
              {(field) => (
                <div className="space-y-2">
                  <Label>Lecturer ID *</Label>
                  <Input
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>
          </div>
          <form.Field
            name="sessionId"
            validators={{ onChange: courseAllocationSchema.shape.sessionId }}
          >
            {(field) => (
              <div className="space-y-2">
                <Label>Session ID *</Label>
                <Input
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </div>
            )}
          </form.Field>
          <div className="grid grid-cols-2 gap-4">
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
                    <SelectTrigger>
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
            <form.Field name="role">
              {(field) => (
                <div className="space-y-2">
                  <Label>Role *</Label>
                  <Select
                    value={field.state.value}
                    onValueChange={(e) =>
                      field.handleChange(
                        e as "Lecturer" | "Co-Lecturer" | "Lab Assistant"
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </form.Field>
          </div>
          <form.Field name="isActive">
            {(field) => (
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={field.state.value}
                  onCheckedChange={(e) => field.handleChange(Boolean(e))}
                />
                <Label>Active</Label>
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
              {mode === "create" ? "Assign Course" : "Update Assignment"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
