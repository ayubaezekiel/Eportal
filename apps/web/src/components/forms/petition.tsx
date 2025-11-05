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

const petitionSchema = z.object({
  id: z.string().uuid().optional(),
  studentId: z.string().uuid(),
  petitionType: z.string(),
  subject: z.string(),
  content: z.string(),
  submittedAt: z.date().default(() => new Date()),
  status: z.string().default("pending"),
  reviewedBy: z.string().uuid().optional(),
  reviewedAt: z.date().optional(),
  response: z.string().optional(),
});

interface PetitionFormProps {
  mode: "create" | "update";
  petition?: z.infer<typeof petitionSchema>;
  onSubmit?: (data: z.infer<typeof petitionSchema>) => Promise<void>;
}

export const PetitionForm = ({ mode, petition, onSubmit }: PetitionFormProps) => {
  const createMutation = useMutation(orpc.petitions.create.mutationOptions());  const updateMutation = useMutation(orpc.petitions.update.mutationOptions());
  const form = useForm({
    defaultValues: petition || {
      studentId: "",
      petitionType: "",
      subject: "",
      content: "",
      submittedAt: new Date(),
      status: "pending",
      reviewedBy: "",
      reviewedAt: undefined,
      response: "",
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
    if (mode === "update" && petition) form.reset(petition);
  }, [petition, mode]);

  const petitionTypes = ["academic", "financial", "disciplinary", "administrative", "other"];
  const statusOptions = ["pending", "under_review", "approved", "rejected"];

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>
          {mode === "create" ? "Submit Petition" : "Update Petition"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit(); }} className="space-y-6">
          <form.Field name="studentId" validators={{ onChange: petitionSchema.shape.studentId }}>
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
          <div className="grid grid-cols-2 gap-4">
            <form.Field name="petitionType">
              {(field) => (
                <div className="space-y-2">
                  <Label>Petition Type *</Label>
                  <Select value={field.state.value} onValueChange={field.handleChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {petitionTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
          </div>
          <form.Field name="subject" validators={{ onChange: petitionSchema.shape.subject }}>
            {(field) => (
              <div className="space-y-2">
                <Label>Subject *</Label>
                <Input
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </div>
            )}
          </form.Field>
          <form.Field name="content" validators={{ onChange: petitionSchema.shape.content }}>
            {(field) => (
              <div className="space-y-2">
                <Label>Content *</Label>
                <Textarea
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  rows={6}
                />
              </div>
            )}
          </form.Field>
          <div className="flex gap-4">
            <Button type="button" variant="outline" onClick={() => form.reset()}>
              {mode === "create" ? "Clear Form" : "Cancel"}
            </Button>
            <Button type="submit">
              {mode === "create" ? "Submit Petition" : "Update Petition"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
