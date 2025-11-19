import { orpc, queryClient } from "@/utils/orpc";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import z from "zod";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

const academicSessionSchema = z.object({
  id: z.string().uuid().optional(),
  sessionName: z.string().min(4, "Session name is required"),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date",
  }),
  endDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date",
  }),
  isCurrent: z.boolean(),
  isActive: z.boolean(),
  firstSemesterStart: z.string().optional(),
  firstSemesterEnd: z.string().optional(),
  secondSemesterStart: z.string().optional(),
  secondSemesterEnd: z.string().optional(),
});

type SessionFormValues = z.infer<typeof academicSessionSchema>;

interface AcademicSessionFormProps {
  mode: "create" | "update";
  session?: SessionFormValues;
}

export const AcademicSessionForm = ({
  mode,
  session,
}: AcademicSessionFormProps) => {
  const createMutation = useMutation(
    orpc.academicSessions.create.mutationOptions({
      onSuccess: () => {
        toast.success("Academic session created successfully");
        queryClient.invalidateQueries({
          queryKey: orpc.academicSessions.getAll.queryKey(),
        });
        form.reset();
      },
      onError: (err) => {
        toast.error(err.message || "Failed to create session");
      },
    })
  );

  const updateMutation = useMutation(
    orpc.academicSessions.update.mutationOptions({
      onSuccess: () => {
        toast.success("Academic session updated successfully");
        queryClient.invalidateQueries({
          queryKey: orpc.academicSessions.getAll.queryKey(),
        });
      },
      onError: (err) => {
        toast.error(err.message || "Failed to update session");
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
      if (mode === "create") {
        await createMutation.mutateAsync(value);
      } else {
        if (!session?.id) throw new Error("Session ID is missing for update");
        await updateMutation.mutateAsync({ ...value, id: session.id });
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
        name="sessionName"
        validators={{ onChange: academicSessionSchema.shape.sessionName }}
        children={(field) => (
          <div className="space-y-1">
            <Label>Session Name *</Label>
            <Input
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="e.g., 2023/2024"
            />
            {field.state.meta.errors && (
              <p className="text-sm text-red-500">
                {field.state.meta.errors.join(", ")}
              </p>
            )}
          </div>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <form.Field
          name="startDate"
          validators={{ onChange: academicSessionSchema.shape.startDate }}
          children={(field) => (
            <div className="space-y-1">
              <Label>Session Start Date *</Label>
              <Input
                type="date"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            </div>
          )}
        />
        <form.Field
          name="endDate"
          validators={{ onChange: academicSessionSchema.shape.endDate }}
          children={(field) => (
            <div className="space-y-1">
              <Label>Session End Date *</Label>
              <Input
                type="date"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            </div>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <form.Field
          name="firstSemesterStart"
          children={(field) => (
            <div className="space-y-1">
              <Label>First Semester Start</Label>
              <Input
                type="date"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            </div>
          )}
        />
        <form.Field
          name="firstSemesterEnd"
          children={(field) => (
            <div className="space-y-1">
              <Label>First Semester End</Label>
              <Input
                type="date"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            </div>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <form.Field
          name="secondSemesterStart"
          children={(field) => (
            <div className="space-y-1">
              <Label>Second Semester Start</Label>
              <Input
                type="date"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            </div>
          )}
        />
        <form.Field
          name="secondSemesterEnd"
          children={(field) => (
            <div className="space-y-1">
              <Label>Second Semester End</Label>
              <Input
                type="date"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            </div>
          )}
        />
      </div>

      <div className="flex items-center space-x-4 pt-2">
        <form.Field
          name="isCurrent"
          children={(field) => (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isCurrent"
                checked={field.state.value}
                onCheckedChange={(checked) =>
                  field.handleChange(Boolean(checked))
                }
              />
              <Label htmlFor="isCurrent">Set as Current Session</Label>
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
                onCheckedChange={(checked) =>
                  field.handleChange(Boolean(checked))
                }
              />
              <Label htmlFor="isActive">Set as Active</Label>
            </div>
          )}
        />
      </div>

      <div className="flex justify-end pt-4 border-t">
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
      </div>
    </form>
  );
};
