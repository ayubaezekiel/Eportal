import { orpc, queryClient } from "@/utils/orpc";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import z from "zod";
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

const facultySchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().max(200),
  code: z.string().max(20),
  description: z.string().optional(),
  deanId: z.string().uuid().optional(),
  establishedYear: z.number().optional(),
  isActive: z.boolean().default(true),
});

interface FacultyFormProps {
  mode: "create" | "update";
  faculty?: z.infer<typeof facultySchema>;
  onSubmit?: (data: z.infer<typeof facultySchema>) => Promise<void>;
}

export const FacultyForm = ({ mode, faculty, onSubmit }: FacultyFormProps) => {
  const createMutation = useMutation(
    orpc.faculties.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: orpc.faculties.getAll.queryKey(),
        });
        toast.success("Faculty created successfully");
      },
    })
  );
  const updateMutation = useMutation(
    orpc.faculties.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: orpc.faculties.getById.queryKey({
            input: { id: faculty?.id as string },
          }),
        });
        toast.success("Faculty updated successfully");
      },
    })
  );
  const { data: deans, isPending: isDeanPending } = useQuery(
    orpc.users.getAll.queryOptions()
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
      try {
        if (onSubmit) {
          await onSubmit(value);
        } else {
          if (mode === "create") {
            await createMutation.mutateAsync(value);
          } else {
            await updateMutation.mutateAsync({
              id: `${faculty?.id}`,
              ...value,
            });
          }
        }
      } catch (error: any) {
        toast.error(error.message || "An error occurred");
      }
    },
  });

  return (
    <Card className="mt-10">
      <CardHeader>
        <CardTitle>{mode === "create" ? "Create" : "Update"} Faculty</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          <form.Field name="name">
            {(field) => (
              <div>
                <Label className="mb-2">Faculty Name</Label>
                <Input
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </div>
            )}
          </form.Field>

          <form.Field name="code">
            {(field) => (
              <div>
                <Label className="mb-2">Faculty Code</Label>
                <Input
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
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

          <form.Field name="deanId">
            {(field) => (
              <div>
                <Label className="mb-2">Dean</Label>
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
                      <SelectItem value={d.id}>
                        {d.name} - {d.staffId}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </form.Field>

          <form.Field name="establishedYear">
            {(field) => (
              <div>
                <Label className="mb-2">Established Year</Label>
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
              ? "Create Faculty"
              : "Update Faculty"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
