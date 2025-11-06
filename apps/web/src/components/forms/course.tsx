import { orpc, queryClient } from "@/utils/orpc";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import z from "zod";
import { FieldError, useAppForm } from "../form";
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
import { Textarea } from "../ui/textarea";

const courseSchema = z.object({
  id: z.string().uuid().optional(),
  courseCode: z.string().min(6),
  courseTitle: z.string().min(5),
  creditUnits: z.number().min(1).max(6),
  courseType: z.string(),
  level: z.number().min(100).max(900),
  semester: z.string(),
  departmentId: z.string().uuid(),
  description: z.string().optional(),
  isActive: z.boolean(),
});

interface CourseFormProps {
  mode: "create" | "update";
  course?: z.infer<typeof courseSchema>;
  onSubmit?: (data: z.infer<typeof courseSchema>) => Promise<void>;
}

export const CourseForm = ({ mode, course, onSubmit }: CourseFormProps) => {
  const createMutation = useMutation(
    orpc.courses.create.mutationOptions({
      onSuccess: () => {
        toast.success("Course created successfully");
        queryClient.invalidateQueries({
          queryKey: orpc.courses.create.key(),
        });
      },
      onError: (err) => {
        toast.error(err.message || "An error occurred");
      },
    })
  );
  const updateMutation = useMutation(
    orpc.courses.update.mutationOptions({
      onSuccess: () => {
        toast.success("Course updated successfully");
        queryClient.invalidateQueries({
          queryKey: orpc.courses.update.key(),
        });
      },
      onError: (err) => {
        toast.error(err.message || "An error occurred");
      },
    })
  );

  const form = useAppForm({
    defaultValues: course || {
      courseCode: "",
      courseTitle: "",
      creditUnits: 3,
      courseType: "Core",
      level: 100,
      semester: "First",
      departmentId: "",
      description: "",
      isActive: true,
    },
    validators: {
      onChange: courseSchema,
    },
    onSubmit: async ({ value }) => {
      if (onSubmit) {
        await onSubmit(value);
      } else {
        if (mode === "create") {
          await createMutation.mutateAsync(value);
        } else {
          await updateMutation.mutateAsync({ id: `${course?.id}`, ...value });
        }
      }
    },
  });

  return (
    <Card className="mt-10">
      <CardHeader>
        <CardTitle>{mode === "create" ? "Create" : "Update"} Course</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <form.AppField name="courseCode">
              {(field) => (
                <div>
                  <Label className="mb-2">Course Code *</Label>
                  <Input
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  <FieldError field={field} />
                </div>
              )}
            </form.AppField>
            <form.Field name="creditUnits">
              {(field) => (
                <div>
                  <Label className="mb-2">Credit Units</Label>
                  <Input
                    type="number"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(Number(e.target.value))}
                  />
                  <FieldError field={field} />
                </div>
              )}
            </form.Field>
          </div>

          <form.Field name="courseTitle">
            {(field) => (
              <div>
                <Label className="mb-2">Course Title</Label>
                <Input
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                <FieldError field={field} />
              </div>
            )}
          </form.Field>

          <div className="grid grid-cols-2 gap-4">
            <form.Field name="courseType">
              {(field) => (
                <div>
                  <Label className="mb-2">Course Type</Label>
                  <Select
                    value={field.state.value}
                    onValueChange={field.handleChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="select course type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Core">Core</SelectItem>
                      <SelectItem value="Elective">Elective</SelectItem>
                      <SelectItem value="General">General</SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldError field={field} />
                </div>
              )}
            </form.Field>
            <form.Field name="level">
              {(field) => (
                <div>
                  <Label className="mb-2">Level</Label>
                  <Select
                    value={field.state.value.toString()}
                    onValueChange={(value) => field.handleChange(Number(value))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="100">100</SelectItem>
                      <SelectItem value="200">200</SelectItem>
                      <SelectItem value="300">300</SelectItem>
                      <SelectItem value="400">400</SelectItem>
                      <SelectItem value="500">500</SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldError field={field} />
                </div>
              )}
            </form.Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <form.AppField name="semester">
              {(field) => <field.SemesterField />}
            </form.AppField>
            <form.AppField name="departmentId">
              {(field) => <field.DepartmentField />}
            </form.AppField>
          </div>

          <form.Field name="description">
            {(field) => (
              <div>
                <Label>Description</Label>
                <Textarea
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                <FieldError field={field} />
              </div>
            )}
          </form.Field>

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

          <Button
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {createMutation.isPending || updateMutation.isPending
              ? "Saving..."
              : mode === "create"
              ? "Create Course"
              : "Update Course"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
