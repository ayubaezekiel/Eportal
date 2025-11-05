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

const transcriptSchema = z.object({
  id: z.string().uuid().optional(),
  studentId: z.string().uuid(),
  transcriptType: z.string(),
  requestDate: z.date().default(() => new Date()),
  status: z.string().default("pending"),
  processedBy: z.string().uuid().optional(),
  processedAt: z.date().optional(),
  deliveryMethod: z.string(),
  deliveryAddress: z.string().optional(),
  fee: z.number().default(0),
});

interface TranscriptFormProps {
  mode: "create" | "update";
  transcript?: z.infer<typeof transcriptSchema>;
  onSubmit?: (data: z.infer<typeof transcriptSchema>) => Promise<void>;
}

export const TranscriptForm = ({ mode, transcript, onSubmit }: TranscriptFormProps) => {
  const createMutation = useMutation(orpc.transcripts.create.mutationOptions());  const updateMutation = useMutation(orpc.transcripts.update.mutationOptions());
  const form = useForm({
    defaultValues: transcript || {
      studentId: "",
      transcriptType: "",
      requestDate: new Date(),
      status: "pending",
      processedBy: "",
      processedAt: undefined,
      deliveryMethod: "",
      deliveryAddress: "",
      fee: 0,
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
    if (mode === "update" && transcript) form.reset(transcript);
  }, [transcript, mode]);

  const transcriptTypes = ["official", "unofficial", "interim"];
  const statusOptions = ["pending", "processing", "ready", "delivered"];
  const deliveryMethods = ["pickup", "mail", "email"];

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>
          {mode === "create" ? "Request Transcript" : "Update Transcript Request"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit(); }} className="space-y-6">
          <form.Field name="studentId" validators={{ onChange: transcriptSchema.shape.studentId }}>
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
            <form.Field name="transcriptType">
              {(field) => (
                <div className="space-y-2">
                  <Label>Transcript Type *</Label>
                  <Select value={field.state.value} onValueChange={field.handleChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {transcriptTypes.map((type) => (
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
                        <SelectItem key={status} value={status}>{status}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </form.Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <form.Field name="deliveryMethod">
              {(field) => (
                <div className="space-y-2">
                  <Label>Delivery Method *</Label>
                  <Select value={field.state.value} onValueChange={field.handleChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      {deliveryMethods.map((method) => (
                        <SelectItem key={method} value={method}>{method}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </form.Field>
            <form.Field name="fee">
              {(field) => (
                <div className="space-y-2">
                  <Label>Fee</Label>
                  <Input
                    type="number"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(Number(e.target.value))}
                  />
                </div>
              )}
            </form.Field>
          </div>
          <div className="flex gap-4">
            <Button type="button" variant="outline" onClick={() => form.reset()}>
              {mode === "create" ? "Clear Form" : "Cancel"}
            </Button>
            <Button type="submit">
              {mode === "create" ? "Submit Request" : "Update Request"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
