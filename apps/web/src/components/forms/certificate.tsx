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

const certificateSchema = z.object({
  id: z.string().uuid().optional(),
  studentId: z.string().uuid(),
  certificateType: z.string(),
  degreeClass: z.string().optional(),
  graduationDate: z.date(),
  issuedDate: z.date().default(() => new Date()),
  certificateNumber: z.string(),
  status: z.string().default("pending"),
  verificationCode: z.string().optional(),
});

interface CertificateFormProps {
  mode: "create" | "update";
  certificate?: z.infer<typeof certificateSchema>;
  onSubmit?: (data: z.infer<typeof certificateSchema>) => Promise<void>;
}

export const CertificateForm = ({ mode, certificate, onSubmit }: CertificateFormProps) => {
  const createMutation = useMutation(orpc.certificates.create.mutationOptions());  const updateMutation = useMutation(orpc.certificates.update.mutationOptions());
  const form = useForm({
    defaultValues: certificate || {
      studentId: "",
      certificateType: "",
      degreeClass: "",
      graduationDate: new Date(),
      issuedDate: new Date(),
      certificateNumber: "",
      status: "pending",
      verificationCode: "",
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
    if (mode === "update" && certificate) form.reset(certificate);
  }, [certificate, mode]);

  const certificateTypes = ["degree", "diploma", "certificate"];
  const degreeClasses = ["first_class", "second_class_upper", "second_class_lower", "third_class", "pass"];
  const statusOptions = ["pending", "issued", "revoked"];

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>
          {mode === "create" ? "Issue Certificate" : "Update Certificate"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit(); }} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <form.Field name="studentId" validators={{ onChange: certificateSchema.shape.studentId }}>
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
            <form.Field name="certificateNumber" validators={{ onChange: certificateSchema.shape.certificateNumber }}>
              {(field) => (
                <div className="space-y-2">
                  <Label>Certificate Number *</Label>
                  <Input
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <form.Field name="certificateType">
              {(field) => (
                <div className="space-y-2">
                  <Label>Certificate Type *</Label>
                  <Select value={field.state.value} onValueChange={field.handleChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {certificateTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </form.Field>
            <form.Field name="degreeClass">
              {(field) => (
                <div className="space-y-2">
                  <Label>Degree Class</Label>
                  <Select value={field.state.value} onValueChange={field.handleChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {degreeClasses.map((cls) => (
                        <SelectItem key={cls} value={cls}>{cls.replace('_', ' ')}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </form.Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <form.Field name="graduationDate">
              {(field) => (
                <div className="space-y-2">
                  <Label>Graduation Date *</Label>
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
              {mode === "create" ? "Issue Certificate" : "Update Certificate"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
