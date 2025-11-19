import { orpc, queryClient } from "@/utils/orpc";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import z from "zod";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";

const examinationSchema = z.object({
  id: z.string().uuid().optional(),
  courseId: z.string().uuid("Please select a course"),
  examType: z.string().min(1, "Exam type is required"),
  examDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date",
  }),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  venue: z.string().min(1, "Venue is required"),
  sessionId: z.string().uuid("Please select an academic session"),
  semester: z.string().min(1, "Semester is required"),
  instructions: z.string().optional(),
});

type ExaminationFormValues = z.infer<typeof examinationSchema>;

interface ExaminationFormProps {
  mode: "create" | "update";
  examination?: ExaminationFormValues;
}

export const ExaminationForm = ({ mode, examination }: ExaminationFormProps) => {
  const { data: courses } = useQuery(orpc.courses.getAll.queryOptions());
  const { data: academicSessions } = useQuery(
    orpc.academicSessions.getAll.queryOptions()
  );

  const createMutation = useMutation(
    orpc.examinations.create.mutationOptions({
      onSuccess: () => {
        toast.success("Examination scheduled successfully");
        queryClient.invalidateQueries({
          queryKey: orpc.examinations.getAll.queryKey(),
        });
        form.reset();
      },
      onError: (err) => {
        toast.error(err.message || "Failed to schedule examination");
      },
    })
  );

  const updateMutation = useMutation(
    orpc.examinations.update.mutationOptions({
      onSuccess: () => {
        toast.success("Examination updated successfully");
        queryClient.invalidateQueries({
          queryKey: orpc.examinations.getAll.queryKey(),
        });
      },
      onError: (err) => {
        toast.error(err.message || "Failed to update examination");
      },
    })
  );

  const form = useForm({
    defaultValues: examination
      ? {
          ...examination,
          examDate: examination.examDate.toISOString().split("T")[0],
        }
      : {
          courseId: "",
          examType: "final",
          examDate: new Date().toISOString().split("T")[0],
          startTime: "09:00",
          endTime: "12:00",
          venue: "",
          sessionId: "",
          semester: "First",
          instructions: "",
        },
    onSubmit: async ({ value }) => {
      if (mode === "create") {
        await createMutation.mutateAsync(value);
      } else {
        if (!examination?.id)
          throw new Error("Examination ID is missing for update");
        await updateMutation.mutateAsync({ ...value, id: examination.id });
      }
    },
  });

  const examTypes = ["midterm", "final", "quiz", "practical"];
  const semesters = ["First", "Second"]; // Assuming capitalized for consistency

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-6 py-4"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <form.Field
          name="courseId"
          validators={{ onChange: examinationSchema.shape.courseId }}
          children={(field) => (
            <div className="space-y-1">
              <Label>Course *</Label>
              <Select
                value={field.state.value}
                onValueChange={field.handleChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {courses?.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.courseCode} - {course.courseTitle}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {field.state.meta.errors && (
                <p className="text-sm text-red-500">
                  {field.state.meta.errors.join(", ")}
                </p>
              )}
            </div>
          )}
        />
        <form.Field
          name="examType"
          validators={{ onChange: examinationSchema.shape.examType }}
          children={(field) => (
            <div className="space-y-1">
              <Label>Exam Type *</Label>
              <Select
                value={field.state.value}
                onValueChange={field.handleChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {examTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {field.state.meta.errors && (
                <p className="text-sm text-red-500">
                  {field.state.meta.errors.join(", ")}
                </p>
              )}
            </div>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <form.Field
          name="sessionId"
          validators={{ onChange: examinationSchema.shape.sessionId }}
          children={(field) => (
            <div className="space-y-1">
              <Label>Academic Session *</Label>
              <Select
                value={field.state.value}
                onValueChange={field.handleChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select session" />
                </SelectTrigger>
                <SelectContent>
                  {academicSessions?.map((session) => (
                    <SelectItem key={session.id} value={session.id}>
                      {session.sessionName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {field.state.meta.errors && (
                <p className="text-sm text-red-500">
                  {field.state.meta.errors.join(", ")}
                </p>
              )}
            </div>
          )}
        />
        <form.Field
          name="semester"
          validators={{ onChange: examinationSchema.shape.semester }}
          children={(field) => (
            <div className="space-y-1">
              <Label>Semester *</Label>
              <Select
                value={field.state.value}
                onValueChange={field.handleChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select semester" />
                </SelectTrigger>
                <SelectContent>
                  {semesters.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {field.state.meta.errors && (
                <p className="text-sm text-red-500">
                  {field.state.meta.errors.join(", ")}
                </p>
              )}
            </div>
          )}
        />
      </div>

      <form.Field
        name="examDate"
        validators={{ onChange: examinationSchema.shape.examDate }}
        children={(field) => (
          <div className="space-y-1">
            <Label>Exam Date *</Label>
            <Input
              type="date"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
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
          name="startTime"
          validators={{ onChange: examinationSchema.shape.startTime }}
          children={(field) => (
            <div className="space-y-1">
              <Label>Start Time *</Label>
              <Input
                type="time"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
              {field.state.meta.errors && (
                <p className="text-sm text-red-500">
                  {field.state.meta.errors.join(", ")}
                </p>
              )}
            </div>
          )}
        />
        <form.Field
          name="endTime"
          validators={{ onChange: examinationSchema.shape.endTime }}
          children={(field) => (
            <div className="space-y-1">
              <Label>End Time *</Label>
              <Input
                type="time"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
              {field.state.meta.errors && (
                <p className="text-sm text-red-500">
                  {field.state.meta.errors.join(", ")}
                </p>
              )}
            </div>
          )}
        />
      </div>

      <form.Field
        name="venue"
        validators={{ onChange: examinationSchema.shape.venue }}
        children={(field) => (
          <div className="space-y-1">
            <Label>Venue *</Label>
            <Input
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            />
            {field.state.meta.errors && (
              <p className="text-sm text-red-500">
                {field.state.meta.errors.join(", ")}
              </p>
            )}
          </div>
        )}
      />

      <form.Field
        name="instructions"
        children={(field) => (
          <div className="space-y-1">
            <Label>Instructions</Label>
            <Textarea
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              rows={4}
            />
          </div>
        )}
      />

      <div className="flex justify-end pt-4 border-t">
        <Button
          type="submit"
          disabled={createMutation.isPending || updateMutation.isPending}
        >
          {createMutation.isPending || updateMutation.isPending
            ? "Saving..."
            : mode === "create"
            ? "Schedule Exam"
            : "Update Exam"}
        </Button>
      </div>
    </form>
  );
};