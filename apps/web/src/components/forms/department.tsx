import type { Department } from "@/types/types";
import { orpc, queryClient } from "@/utils/orpc";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import z from "zod";
import { useForm } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const departmentSchema = z.object({
  id: z.string().uuid().optional(),
  facultyId: z.string().uuid("Please select a faculty"),
  name: z.string().min(2, "Department name is required"),
  code: z.string().min(2, "Department code is required"),
  description: z.string().optional(),
  establishedYear: z.number().min(1900).max(new Date().getFullYear()),
  isActive: z.boolean(),
});

type DepartmentFormValues = z.infer<typeof departmentSchema>;

interface DepartmentFormProps {
  mode?: "create" | "update";
  department?: Department;
}

export function DepartmentForm({ mode = "create", department }: DepartmentFormProps) {
  const { data: faculties } = useQuery(orpc.faculties.getAll.queryOptions());

  const createMutation = useMutation(
    orpc.departments.create.mutationOptions({
      onSuccess: () => {
        toast.success("Department created successfully");
        queryClient.invalidateQueries({
          queryKey: orpc.departments.getAll.queryKey(),
        });
        form.reset();
      },
      onError: (err) => {
        toast.error(err.message || "Failed to create department");
      },
    })
  );

  const updateMutation = useMutation(
    orpc.departments.update.mutationOptions({
      onSuccess: () => {
        toast.success("Department updated successfully");
        queryClient.invalidateQueries({
          queryKey: orpc.departments.getAll.queryKey(),
        });
      },
      onError: (err) => {
        toast.error(err.message || "Failed to update department");
      },
    })
  );

  const form = useForm({
    defaultValues: department || {
      facultyId: "",
      name: "",
      code: "",
      description: "",
      establishedYear: new Date().getFullYear(),
      isActive: true,
    },
    onSubmit: async ({ value }) => {
      if (mode === "update" && department) {
        await updateMutation.mutateAsync({ id: department.id, ...value });
      } else {
        await createMutation.mutateAsync(value);
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
      <form.Field
        name="facultyId"
        validators={{ onChange: departmentSchema.shape.facultyId }}
        children={(field) => (
          <div className="space-y-1">
            <Label>Faculty *</Label>
            <Select
              value={field.state.value}
              onValueChange={field.handleChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a faculty" />
              </SelectTrigger>
              <SelectContent>
                {faculties?.map((faculty) => (
                  <SelectItem key={faculty.id} value={faculty.id}>
                    {faculty.name}
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
        name="name"
        validators={{ onChange: departmentSchema.shape.name }}
        children={(field) => (
          <div className="space-y-1">
            <Label>Department Name *</Label>
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
        name="code"
        validators={{ onChange: departmentSchema.shape.code }}
        children={(field) => (
          <div className="space-y-1">
            <Label>Department Code *</Label>
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
        name="establishedYear"
        validators={{ onChange: departmentSchema.shape.establishedYear }}
        children={(field) => (
          <div className="space-y-1">
            <Label>Established Year *</Label>
            <Input
              type="number"
              value={field.state.value}
              onChange={(e) => field.handleChange(Number(e.target.value))}
            />
          </div>
        )}
      />

      <form.Field
        name="isActive"
        children={(field) => (
          <div className="flex items-center space-x-2 pt-2">
            <Switch
              id="isActive"
              checked={field.state.value}
              onCheckedChange={(checked) => field.handleChange(Boolean(checked))}
            />
            <Label htmlFor="isActive">Active</Label>
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
            ? "Create Department"
            : "Update Department"}
        </Button>
      </div>
    </form>
  );
}
