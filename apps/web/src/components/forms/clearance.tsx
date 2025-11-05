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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";

const clearanceSchema = z.object({
  id: z.string().uuid().optional(),
  studentId: z.string().uuid(),
  department: z.string(),
  status: z.string().default("pending"),
  clearedBy: z.string().uuid().optional(),
  clearedAt: z.date().optional(),
  comments: z.string().optional(),
  sessionId: z.string().uuid(),
});

interface ClearanceFormProps {
  mode: "create" | "update";
  clearance?: z.infer<typeof clearanceSchema>;
  onSubmit?: (data: z.infer<typeof clearanceSchema>) => Promise<void>;
}

export const ClearanceForm = ({ mode, clearance, onSubmit }: ClearanceFormProps) => {
  const createMutation = useMutation(orpc.clearances.create.mutationOptions());  const updateMutation = useMutation(orpc.clearances.update.mutationOptions());
  const form = useForm({
    defaultValues: clearance || {
      studentId: "",
      department: "",
      status: "pending",
      clearedBy: "",
      clearedAt: undefined,
      comments: "",
      sessionId: "",
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
    if (mode === "update" && clearance) form.reset(clearance);
  }, [clearance, mode]);

  const statusOptions = ["pending", "approved", "rejected"];

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>
          {mode === "create" ? "Create Clearance" : "Update Clearance"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit(); }} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <form.Field name="studentId" validators={{ onChange: clearanceSchema.shape.studentId }}>
              {(field) => (
                <div className="space-y-2">
                  <Label>Student ID *</Label>
                  <Input
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>
            <form.Field name="department" validators={{ onChange: clearanceSchema.shape.department }}>
              {(field) => (
                <div className="space-y-2">
                  <Label>Department *</Label>
                  <Input
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>
          </div>
          <form.Field name="status">
            {(field) => (
              <div className="space-y-2">
                <Label>Status *</Label>
                <Select value={field.state.value} onValueChange={field.handleChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </form.Field>
          <form.Field name="comments">
            {(field) => (
              <div className="space-y-2">
                <Label>Comments</Label>
                <Textarea
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </div>
            )}
          </form.Field>
          <div className="flex gap-4">
            <Button type="button" variant="outline" onClick={() => form.reset()}>
              {mode === "create" ? "Clear Form" : "Cancel"}
            </Button>
            <Button type="submit">
              {mode === "create" ? "Create Clearance" : "Update Clearance"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
