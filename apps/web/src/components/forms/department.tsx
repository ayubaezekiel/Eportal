import type { Department } from "@/types/types";
import { orpc, queryClient } from "@/utils/orpc";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAppForm } from "../form";
import { Button } from "../ui/button";
import { DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { Textarea } from "../ui/textarea";

interface DepartmentFormProps {
  mode?: "create" | "update";
  department?: Department;
  onSubmit?: () => void;
}

export function DepartmentForm({
  mode = "create",
  department,
  onSubmit,
}: DepartmentFormProps) {
  const createMutation = useMutation(
    orpc.departments.create.mutationOptions({
      onSuccess: () => {
        toast.success("Department created successfully");
        form.reset();
        queryClient.invalidateQueries({
          queryKey: orpc.departments.getAll.queryKey(),
        });
      },
    })
  );
  const updateMutation = useMutation(
    orpc.departments.update.mutationOptions({
      onSuccess: () => {
        toast.success("Department updated successfully");
        form.reset();
        queryClient.invalidateQueries({
          queryKey: orpc.departments.getById.queryKey({
            input: { id: department?.id as string },
          }),
        });
      },
    })
  );
  const form = useAppForm({
    defaultValues: {
      facultyId: department?.facultyId || "",
      name: department?.name || "",
      code: department?.code || "",
      description: department?.description || "",
      establishedYear: department?.establishedYear || new Date().getFullYear(),
      isActive: department?.isActive ?? true,
    },
    onSubmit: async ({ value }) => {
      try {
        if (mode === "update" && department) {
          await updateMutation.mutateAsync({ id: department.id, ...value });
        } else {
          await createMutation.mutateAsync(value);
        }
        onSubmit?.();
      } catch (err: any) {
        toast.error(err.message);
      }
    },
  });

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {mode === "update" ? "Update Department" : "Add New Department"}
        </DialogTitle>
      </DialogHeader>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
        className="space-y-4"
      >
        <form.AppField name="facultyId">
          {(field) => <field.FacultyField />}
        </form.AppField>

        <form.AppField name="name">
          {(field) => (
            <div>
              <Label className="mb-2">Department Name</Label>
              <Input
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                required
              />
            </div>
          )}
        </form.AppField>

        <form.Field name="code">
          {(field) => (
            <div>
              <Label className="mb-2">Department Code</Label>
              <Input
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                required
              />
            </div>
          )}
        </form.Field>
        <form.Field name="description">
          {(field) => (
            <div>
              <Label className="mb-2">Description</Label>
              <Textarea
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            </div>
          )}
        </form.Field>
        <form.Field name="establishedYear">
          {(field) => (
            <div>
              <Label className="mb-2">Established Year</Label>
              <Input
                type="number"
                value={field.state.value}
                onChange={(e) => field.handleChange(Number(e.target.value))}
              />
            </div>
          )}
        </form.Field>
        <form.Field name="isActive">
          {(field) => (
            <div className="flex items-center space-x-2">
              <Switch
                checked={field.state.value}
                onCheckedChange={field.handleChange}
              />
              <Label>Active</Label>
            </div>
          )}
        </form.Field>
        <Button type="submit">
          {mode === "update" ? "Update Department" : "Create Department"}
        </Button>
      </form>
    </>
  );
}
