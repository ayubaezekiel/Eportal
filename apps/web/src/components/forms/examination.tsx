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

const examinationSchema = z.object({
  id: z.string().uuid().optional(),
  courseId: z.string().uuid(),
  examType: z.string(),
  examDate: z.date(),
  startTime: z.string(),
  endTime: z.string(),
  venue: z.string(),
  sessionId: z.string().uuid(),
  semester: z.string(),
  instructions: z.string().optional(),
});

interface ExaminationFormProps {
  mode: "create" | "update";
  examination?: z.infer<typeof examinationSchema>;
  onSubmit?: (data: z.infer<typeof examinationSchema>) => Promise<void>;
}

export const ExaminationForm = ({ mode, examination, onSubmit }: ExaminationFormProps) => {
  const createMutation = useMutation(orpc.examinations.create.mutationOptions());  const updateMutation = useMutation(orpc.examinations.update.mutationOptions());
  const form = useForm({
    defaultValues: examination || {
      courseId: "",
      examType: "",
      examDate: new Date(),
      startTime: "",
      endTime: "",
      venue: "",
      sessionId: "",
      semester: "",
      instructions: "",
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
    if (mode === "update" && examination) form.reset(examination);
  }, [examination, mode]);

  const examTypes = ["midterm", "final", "quiz", "practical"];
  const semesters = ["first", "second"];

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>
          {mode === "create" ? "Schedule Examination" : "Update Examination"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit(); }} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <form.Field name="courseId" validators={{ onChange: examinationSchema.shape.courseId }}>
              {(field) => (
                <div className="space-y-2">
                  <Label>Course ID *</Label>
                  <Input
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>
            <form.Field name="examType">
              {(field) => (
                <div className="space-y-2">
                  <Label>Exam Type *</Label>
                  <Select value={field.state.value} onValueChange={field.handleChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {examTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </form.Field>
          </div>
          <form.Field name="examDate">
            {(field) => (
              <div className="space-y-2">
                <Label>Exam Date *</Label>
                <Input
                  type="date"
                  value={field.state.value?.toISOString().split('T')[0]}
                  onChange={(e) => field.handleChange(new Date(e.target.value))}
                />
              </div>
            )}
          </form.Field>
          <div className="grid grid-cols-3 gap-4">
            <form.Field name="startTime">
              {(field) => (
                <div className="space-y-2">
                  <Label>Start Time *</Label>
                  <Input
                    type="time"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>
            <form.Field name="endTime">
              {(field) => (
                <div className="space-y-2">
                  <Label>End Time *</Label>
                  <Input
                    type="time"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>
            <form.Field name="venue">
              {(field) => (
                <div className="space-y-2">
                  <Label>Venue *</Label>
                  <Input
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
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
              {mode === "create" ? "Schedule Exam" : "Update Exam"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
