import { orpc, queryClient } from "@/utils/orpc";
import { useMutation, useQuery } from "@tanstack/react-query";
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
import { Textarea } from "../ui/textarea";

const courseSchema = z.object({
  id: z.string().uuid().optional(),
  courseCode: z.string().min(3, "Course code is required"),
  courseTitle: z.string().min(3, "Course title is required"),
  creditUnits: z.number().min(0).max(12),
  courseType: z.string(),
  level: z.number().min(100).max(900),
  semester: z.string(),
  departmentId: z.string().uuid("Please select a department"),
  description: z.string().optional(),
  isActive: z.boolean(),
});

type CourseFormValues = z.infer<typeof courseSchema>;

interface CourseFormProps {
  mode: "create" | "update";
  course?: CourseFormValues;
}

export const CourseForm = ({ mode, course }: CourseFormProps) => {
  const { data: departments } = useQuery(
    orpc.departments.getAll.queryOptions()
  );

  const createMutation = useMutation(
    orpc.courses.create.mutationOptions({
      onSuccess: () => {
        toast.success("Course created successfully");
        queryClient.invalidateQueries({
          queryKey: orpc.courses.getAll.queryKey(),
        });
        form.reset();
      },
      onError: (err) => {
        toast.error(err.message || "Failed to create course");
      },
    })
  );

  const updateMutation = useMutation(
    orpc.courses.update.mutationOptions({
      onSuccess: () => {
        toast.success("Course updated successfully");
        queryClient.invalidateQueries({
          queryKey: orpc.courses.getAll.queryKey(),
        });
      },
      onError: (err) => {
        toast.error(err.message || "Failed to update course");
      },
    })
  );

  const form = useForm({
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
    onSubmit: async ({ value }) => {
      if (mode === "create") {
        await createMutation.mutateAsync(value);
      } else {
        if (!course?.id) throw new Error("Course ID is missing for update");
        await updateMutation.mutateAsync({ ...value, id: course.id });
      }
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-6 py-4"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <form.Field
          name="courseCode"
          validators={{ onChange: courseSchema.shape.courseCode }}
          children={(field) => (
            <div className="space-y-1">
              <Label>Course Code *</Label>
              <Input
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
              {field.state.meta.errors && (
                <p className="text-sm text-red-500">
                  {field.state.meta.errors.join(", ")}
                </p>
              )}
            </div>
          )}
        />
        <form.Field
          name="creditUnits"
          validators={{ onChange: courseSchema.shape.creditUnits }}
          children={(field) => (
            <div className="space-y-1">
              <Label>Credit Units *</Label>
              <Input
                type="number"
                value={field.state.value}
                onChange={(e) => field.handleChange(Number(e.target.value))}
              />
            </div>
          )}
        />
      </div>

      <form.Field
        name="courseTitle"
        validators={{ onChange: courseSchema.shape.courseTitle }}
        children={(field) => (
          <div className="space-y-1">
            <Label>Course Title *</Label>
            <Input
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            />
          </div>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <form.Field
          name="courseType"
          children={(field) => (
            <div className="space-y-1">
              <Label>Course Type *</Label>
              <Select
                value={field.state.value}
                onValueChange={field.handleChange}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Core">Core</SelectItem>
                  <SelectItem value="Elective">Elective</SelectItem>
                  <SelectItem value="General">General</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        />
        <form.Field
          name="level"
          children={(field) => (
            <div className="space-y-1">
              <Label>Level *</Label>
              <Select
                value={String(field.state.value)}
                onValueChange={(value) => field.handleChange(Number(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[100, 200, 300, 400, 500, 600, 700, 800, 900].map(
                    (level) => (
                      <SelectItem key={level} value={String(level)}>
                        {level}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <form.Field
          name="semester"
          children={(field) => (
            <div className="space-y-1">
              <Label>Semester *</Label>
              <Select
                value={field.state.value}
                onValueChange={field.handleChange}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="First">First</SelectItem>
                  <SelectItem value="Second">Second</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        />
        <form.Field
          name="departmentId"
          validators={{ onChange: courseSchema.shape.departmentId }}
          children={(field) => (
            <div className="space-y-1">
              <Label>Department *</Label>
              <Select
                value={field.state.value}
                onValueChange={field.handleChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a department" />
                </SelectTrigger>
                <SelectContent>
                  {departments?.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        />
      </div>

      <form.Field
        name="description"
        children={(field) => (
          <div className="space-y-1">
            <Label>Description</Label>
            <Textarea
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            />
          </div>
        )}
      />

      <form.Field
        name="isActive"
        children={(field) => (
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isActive"
              checked={field.state.value}
              onCheckedChange={(checked) => field.handleChange(Boolean(checked))}
            />
            <Label htmlFor="isActive">Is Active</Label>
          </div>
        )}
      />

      <div className="flex justify-end pt-4 border-t">
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
      </div>
    </form>
  );
};
