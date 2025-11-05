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

const scholarshipApplicationSchema = z.object({
  id: z.string().uuid().optional(),
  scholarshipId: z.string().uuid(),
  studentId: z.string().uuid(),
  applicationDate: z.date().default(() => new Date()),
  personalStatement: z.string(),
  financialNeed: z.string().optional(),
  academicAchievements: z.string().optional(),
  status: z.string().default("pending"),
  reviewedBy: z.string().uuid().optional(),
  reviewedAt: z.date().optional(),
  reviewComments: z.string().optional(),
});

interface ScholarshipApplicationFormProps {
  mode: "create" | "update";
  application?: z.infer<typeof scholarshipApplicationSchema>;
  onSubmit?: (data: z.infer<typeof scholarshipApplicationSchema>) => Promise<void>;
}

export const ScholarshipApplicationForm = ({ mode, application, onSubmit }: ScholarshipApplicationFormProps) => {
  const createMutation = useMutation(orpc.scholarshipApplications.create.mutationOptions());  const updateMutation = useMutation(orpc.scholarshipApplications.update.mutationOptions());
  const form = useForm({
    defaultValues: application || {
      scholarshipId: "",
      studentId: "",
      applicationDate: new Date(),
      personalStatement: "",
      financialNeed: "",
      academicAchievements: "",
      status: "pending",
      reviewedBy: "",
      reviewedAt: undefined,
      reviewComments: "",
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
    if (mode === "update" && application) form.reset(application);
  }, [application, mode]);

  const statusOptions = ["pending", "under_review", "approved", "rejected"];

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>
          {mode === "create" ? "Apply for Scholarship" : "Update Application"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit(); }} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <form.Field name="scholarshipId" validators={{ onChange: scholarshipApplicationSchema.shape.scholarshipId }}>
              {(field) => (
                <div className="space-y-2">
                  <Label>Scholarship ID *</Label>
                  <Input
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>
            <form.Field name="studentId" validators={{ onChange: scholarshipApplicationSchema.shape.studentId }}>
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
          </div>
          <form.Field name="personalStatement" validators={{ onChange: scholarshipApplicationSchema.shape.personalStatement }}>
            {(field) => (
              <div className="space-y-2">
                <Label>Personal Statement *</Label>
                <Textarea
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  rows={6}
                  placeholder="Explain why you deserve this scholarship..."
                />
              </div>
            )}
          </form.Field>
          <form.Field name="financialNeed">
            {(field) => (
              <div className="space-y-2">
                <Label>Financial Need</Label>
                <Textarea
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  rows={4}
                  placeholder="Describe your financial situation..."
                />
              </div>
            )}
          </form.Field>
          <form.Field name="academicAchievements">
            {(field) => (
              <div className="space-y-2">
                <Label>Academic Achievements</Label>
                <Textarea
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  rows={4}
                  placeholder="List your academic achievements..."
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
                      <SelectItem key={status} value={status}>{status.replace('_', ' ')}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </form.Field>
          <div className="flex gap-4">
            <Button type="button" variant="outline" onClick={() => form.reset()}>
              {mode === "create" ? "Clear Form" : "Cancel"}
            </Button>
            <Button type="submit">
              {mode === "create" ? "Submit Application" : "Update Application"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
