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

const scholarshipSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string(),
  description: z.string(),
  amount: z.number(),
  eligibilityCriteria: z.string(),
  applicationDeadline: z.date(),
  academicYear: z.string(),
  maxRecipients: z.number(),
  status: z.string().default("active"),
  sponsorName: z.string().optional(),
});

interface ScholarshipFormProps {
  mode: "create" | "update";
  scholarship?: z.infer<typeof scholarshipSchema>;
  onSubmit?: (data: z.infer<typeof scholarshipSchema>) => Promise<void>;
}

export const ScholarshipForm = ({ mode, scholarship, onSubmit }: ScholarshipFormProps) => {
  const createMutation = useMutation(orpc.scholarships.create.mutationOptions());  const updateMutation = useMutation(orpc.scholarships.update.mutationOptions());
  const form = useForm({
    defaultValues: scholarship || {
      name: "",
      description: "",
      amount: 0,
      eligibilityCriteria: "",
      applicationDeadline: new Date(),
      academicYear: "",
      maxRecipients: 1,
      status: "active",
      sponsorName: "",
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
    if (mode === "update" && scholarship) form.reset(scholarship);
  }, [scholarship, mode]);

  const statusOptions = ["active", "inactive", "closed"];

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>
          {mode === "create" ? "Create Scholarship" : "Update Scholarship"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit(); }} className="space-y-6">
          <form.Field name="name" validators={{ onChange: scholarshipSchema.shape.name }}>
            {(field) => (
              <div className="space-y-2">
                <Label>Scholarship Name *</Label>
                <Input
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </div>
            )}
          </form.Field>
          <form.Field name="description" validators={{ onChange: scholarshipSchema.shape.description }}>
            {(field) => (
              <div className="space-y-2">
                <Label>Description *</Label>
                <Textarea
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  rows={4}
                />
              </div>
            )}
          </form.Field>
          <div className="grid grid-cols-2 gap-4">
            <form.Field name="amount" validators={{ onChange: scholarshipSchema.shape.amount }}>
              {(field) => (
                <div className="space-y-2">
                  <Label>Amount *</Label>
                  <Input
                    type="number"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(Number(e.target.value))}
                  />
                </div>
              )}
            </form.Field>
            <form.Field name="maxRecipients" validators={{ onChange: scholarshipSchema.shape.maxRecipients }}>
              {(field) => (
                <div className="space-y-2">
                  <Label>Max Recipients *</Label>
                  <Input
                    type="number"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(Number(e.target.value))}
                  />
                </div>
              )}
            </form.Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <form.Field name="applicationDeadline">
              {(field) => (
                <div className="space-y-2">
                  <Label>Application Deadline *</Label>
                  <Input
                    type="date"
                    value={field.state.value?.toISOString().split('T')[0]}
                    onChange={(e) => field.handleChange(new Date(e.target.value))}
                  />
                </div>
              )}
            </form.Field>
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
          </div>
          <div className="flex gap-4">
            <Button type="button" variant="outline" onClick={() => form.reset()}>
              {mode === "create" ? "Clear Form" : "Cancel"}
            </Button>
            <Button type="submit">
              {mode === "create" ? "Create Scholarship" : "Update Scholarship"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
