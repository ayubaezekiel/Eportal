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

const documentSchema = z.object({
  id: z.string().uuid().optional(),
  userId: z.string().uuid(),
  documentType: z.string(),
  title: z.string(),
  description: z.string().optional(),
  filePath: z.string(),
  fileSize: z.number(),
  mimeType: z.string(),
  status: z.string().default("pending"),
  uploadedAt: z.date().default(() => new Date()),
});

interface DocumentFormProps {
  mode: "create" | "update";
  document?: z.infer<typeof documentSchema>;
  onSubmit?: (data: z.infer<typeof documentSchema>) => Promise<void>;
}

export const DocumentForm = ({ mode, document, onSubmit }: DocumentFormProps) => {
  const createMutation = useMutation(orpc.documents.create.mutationOptions());  const updateMutation = useMutation(orpc.documents.update.mutationOptions());
  const form = useForm({
    defaultValues: document || {
      userId: "",
      documentType: "",
      title: "",
      description: "",
      filePath: "",
      fileSize: 0,
      mimeType: "",
      status: "pending",
      uploadedAt: new Date(),
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
    if (mode === "update" && document) form.reset(document);
  }, [document, mode]);

  const documentTypes = ["transcript", "certificate", "id_card", "passport", "other"];
  const statusOptions = ["pending", "approved", "rejected"];

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>
          {mode === "create" ? "Upload Document" : "Update Document"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit(); }} className="space-y-6">
          <form.Field name="userId" validators={{ onChange: documentSchema.shape.userId }}>
            {(field) => (
              <div className="space-y-2">
                <Label>User ID *</Label>
                <Input
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </div>
            )}
          </form.Field>
          <div className="grid grid-cols-2 gap-4">
            <form.Field name="documentType">
              {(field) => (
                <div className="space-y-2">
                  <Label>Document Type *</Label>
                  <Select value={field.state.value} onValueChange={field.handleChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {documentTypes.map((type) => (
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
          <form.Field name="title" validators={{ onChange: documentSchema.shape.title }}>
            {(field) => (
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </div>
            )}
          </form.Field>
          <form.Field name="description">
            {(field) => (
              <div className="space-y-2">
                <Label>Description</Label>
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
              {mode === "create" ? "Upload Document" : "Update Document"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
