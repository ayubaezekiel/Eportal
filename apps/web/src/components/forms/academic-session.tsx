import { orpc, queryClient } from "@/utils/orpc";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import z from "zod";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

const academicSessionSchema = z.object({
  id: z.string().uuid().optional(),
  sessionName: z.string().min(4),
  startDate: z.string(),
  endDate: z.string(),
  isCurrent: z.boolean().default(false),
  isActive: z.boolean().default(true),
  firstSemesterStart: z.string().optional(),
  firstSemesterEnd: z.string().optional(),
  secondSemesterStart: z.string().optional(),
  secondSemesterEnd: z.string().optional(),
});

interface AcademicSessionFormProps {
  mode: "create" | "update";
  session?: z.infer<typeof academicSessionSchema>;
  onSubmit?: (data: z.infer<typeof academicSessionSchema>) => Promise<void>;
}

export const AcademicSessionForm = ({
  mode,
  session,
  onSubmit,
}: AcademicSessionFormProps) => {
  const createMutation = useMutation(
    orpc.academicSessions.create.mutationOptions({
      onSuccess: () => {
        toast.success("Academic session created successfully");
        queryClient.invalidateQueries({
          queryKey: orpc.academicSessions.key(),
        });
      },
    })
  );
  const updateMutation = useMutation(
    orpc.academicSessions.update.mutationOptions({
      onSuccess: () => {
        toast.success("Academic session created successfully");
        queryClient.invalidateQueries({
          queryKey: orpc.academicSessions.update.queryKey({
            input: {
              id: `${session?.id}`,
              isActive: session?.isActive,
              isCurrent: session?.isCurrent,
              sessionName: session?.sessionName,
            },
          }),
        });
      },
    })
  );

  const form = useForm({
    defaultValues: session || {
      sessionName: "",
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date().toISOString().split("T")[0],
      isCurrent: false,
      isActive: true,
      firstSemesterStart: "",
      firstSemesterEnd: "",
      secondSemesterStart: "",
      secondSemesterEnd: "",
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
              id: `${session?.id}`,
              ...value,
            });
            toast.success("Academic session updated successfully");
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
        <CardTitle>
          {mode === "create" ? "Create" : "Update"} Academic Session
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
          <form.Field name="sessionName">
            {(field) => (
              <div>
                <Label>Session Name</Label>
                <Input
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="e.g., 2023/2024"
                />
              </div>
            )}
          </form.Field>

          <div className="grid grid-cols-2 gap-4">
            <form.Field name="startDate">
              {(field) => (
                <div>
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>
            <form.Field name="endDate">
              {(field) => (
                <div>
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <form.Field name="firstSemesterStart">
              {(field) => (
                <div>
                  <Label>First Semester Start</Label>
                  <Input
                    type="date"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>
            <form.Field name="firstSemesterEnd">
              {(field) => (
                <div>
                  <Label>First Semester End</Label>
                  <Input
                    type="date"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <form.Field name="secondSemesterStart">
              {(field) => (
                <div>
                  <Label>Second Semester Start</Label>
                  <Input
                    type="date"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>
            <form.Field name="secondSemesterEnd">
              {(field) => (
                <div>
                  <Label>Second Semester End</Label>
                  <Input
                    type="date"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>
          </div>

          <div className="flex items-center space-x-4">
            <form.Field name="isCurrent">
              {(field) => (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={field.state.value}
                    onCheckedChange={(e) => field.handleChange(Boolean(e))}
                  />
                  <Label>Current Session</Label>
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
          </div>

          <Button
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {createMutation.isPending || updateMutation.isPending
              ? "Saving..."
              : mode === "create"
              ? "Create Session"
              : "Update Session"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
