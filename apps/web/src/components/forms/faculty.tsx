import { orpc, queryClient } from "@/utils/orpc";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import z from "zod";
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

const facultySchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2, "Faculty name is required"),
  code: z.string().min(2, "Faculty code is required"),
  description: z.string().optional(),
  deanId: z.string().uuid().optional(),
  establishedYear: z.number().optional(),
  isActive: z.boolean().default(true),
});

type FacultyFormValues = z.infer<typeof facultySchema>;

interface FacultyFormProps {
  mode: "create" | "update";
  faculty?: FacultyFormValues;
}

export const FacultyForm = ({ mode, faculty }: FacultyFormProps) => {
  const { data: deans, isPending: isDeanPending } = useQuery(
    orpc.users.getRoles.queryOptions({ input: { userType: "lecturer" } })
  );

  const createMutation = useMutation(
    orpc.faculties.create.mutationOptions({
      onSuccess: () => {
        toast.success("Faculty created successfully");
        queryClient.invalidateQueries({
          queryKey: orpc.faculties.getAll.queryKey(),
        });
        form.reset();
      },
      onError: (err) => {
        toast.error(err.message || "Failed to create faculty");
      },
    })
  );

  const updateMutation = useMutation(
    orpc.faculties.update.mutationOptions({
      onSuccess: () => {
        toast.success("Faculty updated successfully");
        queryClient.invalidateQueries({
          queryKey: orpc.faculties.getAll.queryKey(),
        });
      },
      onError: (err) => {
        toast.error(err.message || "Failed to update faculty");
      },
    })
  );

  const form = useForm({
    defaultValues: faculty || {
      name: "",
      code: "",
      description: "",
      deanId: "",
      establishedYear: new Date().getFullYear(),
      isActive: true,
    },
    onSubmit: async ({ value }) => {
      if (mode === "create") {
        await createMutation.mutateAsync(value);
      } else {
        if (!faculty?.id) throw new Error("Faculty ID is missing for update");
        await updateMutation.mutateAsync({ ...value, id: faculty.id });
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
        name="name"
        validators={{ onChange: facultySchema.shape.name }}
        children={(field) => (
          <div className="space-y-1">
            <Label>Faculty Name *</Label>
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
        validators={{ onChange: facultySchema.shape.code }}
        children={(field) => (
          <div className="space-y-1">
            <Label>Faculty Code *</Label>
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
        name="deanId"
        children={(field) => (
          <div className="space-y-1">
            <Label>Dean</Label>
            <Select
              disabled={isDeanPending}
              value={field.state.value}
              onValueChange={field.handleChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select dean (optional)" />
              </SelectTrigger>
              <SelectContent>
                {deans?.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name} - {d.staffId}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      />

      <form.Field
        name="establishedYear"
        children={(field) => (
          <div className="space-y-1">
            <Label>Established Year</Label>
            <Input
              type="number"
              value={field.state.value || ""}
              onChange={(e) =>
                field.handleChange(
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
            />
          </div>
        )}
      />

      <form.Field
        name="isActive"
        children={(field) => (
          <div className="flex items-center space-x-2 pt-2">
            <Checkbox
              id="isActive"
              checked={field.state.value}
              onCheckedChange={(checked) =>
                field.handleChange(Boolean(checked))
              }
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
            ? "Create Faculty"
            : "Update Faculty"}
        </Button>
      </div>
    </form>
  );
};
