import { orpc } from "@/utils/orpc";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
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

const programmeSchema = z.object({
  id: z.string().uuid().optional(),
  departmentId: z.string().uuid(),
  name: z.string().min(2),
  code: z.string().min(3),
  degreeType: z.string(),
  durationYears: z.number().min(1).max(10),
  minimumCredits: z.number().min(1),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

interface ProgrammeFormProps {
  mode: "create" | "update";
  programme?: z.infer<typeof programmeSchema>;
  onSubmit?: (data: z.infer<typeof programmeSchema>) => Promise<void>;
}

export const ProgrammeForm = ({
  mode,
  programme,
  onSubmit,
}: ProgrammeFormProps) => {
  const createMutation = useMutation(orpc.programmes.create.mutationOptions());
  const updateMutation = useMutation(orpc.programmes.update.mutationOptions());

  const form = useForm({
    defaultValues: programme || {
      departmentId: "",
      name: "",
      code: "",
      degreeType: "B.Sc",
      durationYears: 4,
      minimumCredits: 120,
      description: "",
      isActive: true,
    },
    onSubmit: async ({ value }) => {
      try {
        if (onSubmit) {
          await onSubmit(value);
        } else {
          if (mode === "create") {
            await createMutation.mutateAsync(value);
            toast.success("Programme created successfully");
          } else {
            await updateMutation.mutateAsync({
              id: `${programme?.id}`,
              ...value,
            });
            toast.success("Programme updated successfully");
          }
        }
      } catch (error: any) {
        toast.error(error.message || "An error occurred");
      }
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {mode === "create" ? "Create" : "Update"} Programme
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          <form.Field name="departmentId">
            {(field) => (
              <div>
                <Label>Department</Label>
                <Select
                  value={field.state.value}
                  onValueChange={field.handleChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dept1">Computer Science</SelectItem>
                    <SelectItem value="dept2">Mathematics</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </form.Field>

          <form.Field name="name">
            {(field) => (
              <div>
                <Label>Programme Name</Label>
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
                <Label>Programme Code</Label>
                <Input
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </div>
            )}
          </form.Field>

          <form.Field name="degreeType">
            {(field) => (
              <div>
                <Label>Degree Type</Label>
                <Select
                  value={field.state.value}
                  onValueChange={field.handleChange}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="B.Sc">B.Sc</SelectItem>
                    <SelectItem value="B.Agric">B.Agric</SelectItem>
                    <SelectItem value="M.Sc">M.Sc</SelectItem>
                    <SelectItem value="PhD">PhD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </form.Field>

          <div className="grid grid-cols-2 gap-4">
            <form.Field name="durationYears">
              {(field) => (
                <div>
                  <Label>Duration (Years)</Label>
                  <Input
                    type="number"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(Number(e.target.value))}
                  />
                </div>
              )}
            </form.Field>
            <form.Field name="minimumCredits">
              {(field) => (
                <div>
                  <Label>Minimum Credits</Label>
                  <Input
                    type="number"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(Number(e.target.value))}
                  />
                </div>
              )}
            </form.Field>
          </div>

          <form.Field name="description">
            {(field) => (
              <div>
                <Label>Description</Label>
                <Textarea
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
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
              ? "Create Programme"
              : "Update Programme"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
