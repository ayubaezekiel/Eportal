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

const examCardSchema = z.object({
  id: z.string().uuid().optional(),
  studentId: z.string().uuid(),
  sessionId: z.string().uuid(),
  semester: z.string(),
  level: z.number(),
  issuedDate: z.date().default(() => new Date()),
  status: z.string().default("active"),
  cardNumber: z.string(),
});

interface ExamCardFormProps {
  mode: "create" | "update";
  examCard?: z.infer<typeof examCardSchema>;
  onSubmit?: (data: z.infer<typeof examCardSchema>) => Promise<void>;
}

export const ExamCardForm = ({ mode, examCard, onSubmit }: ExamCardFormProps) => {
  const createMutation = useMutation(orpc.examCards.create.mutationOptions());  const updateMutation = useMutation(orpc.examCards.update.mutationOptions());
  const form = useForm({
    defaultValues: examCard || {
      studentId: "",
      sessionId: "",
      semester: "",
      level: 100,
      issuedDate: new Date(),
      status: "active",
      cardNumber: "",
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
    if (mode === "update" && examCard) form.reset(examCard);
  }, [examCard, mode]);

  const semesters = ["first", "second"];
  const levels = [100, 200, 300, 400, 500];
  const statusOptions = ["active", "expired", "suspended"];

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>
          {mode === "create" ? "Issue Exam Card" : "Update Exam Card"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit(); }} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <form.Field name="studentId" validators={{ onChange: examCardSchema.shape.studentId }}>
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
            <form.Field name="cardNumber" validators={{ onChange: examCardSchema.shape.cardNumber }}>
              {(field) => (
                <div className="space-y-2">
                  <Label>Card Number *</Label>
                  <Input
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <form.Field name="semester">
              {(field) => (
                <div className="space-y-2">
                  <Label>Semester *</Label>
                  <Select value={field.state.value} onValueChange={field.handleChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select semester" />
                    </SelectTrigger>
                    <SelectContent>
                      {semesters.map((sem) => (
                        <SelectItem key={sem} value={sem}>{sem}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </form.Field>
            <form.Field name="level">
              {(field) => (
                <div className="space-y-2">
                  <Label>Level *</Label>
                  <Select value={field.state.value.toString()} onValueChange={(value) => field.handleChange(Number(value))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      {levels.map((level) => (
                        <SelectItem key={level} value={level.toString()}>{level}</SelectItem>
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
          <div className="flex gap-4">
            <Button type="button" variant="outline" onClick={() => form.reset()}>
              {mode === "create" ? "Clear Form" : "Cancel"}
            </Button>
            <Button type="submit">
              {mode === "create" ? "Issue Card" : "Update Card"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
