import { orpc, queryClient } from "@/utils/orpc";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";
import z from "zod";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Checkbox } from "../ui/checkbox";
import { useUser } from "@/hooks/auth";
import { useAppForm } from "../form";

const courseRegistrationSchema = z.object({
  id: z.string().uuid().optional(),
  studentId: z.string().uuid(),
  courseId: z.string().uuid(),
  sessionId: z.string().uuid(),
  semester: z.enum(["First", "Second"]),
  registrationType: z
    .enum(["Normal", "Carry Over", "Spillover"])
    .default("Normal"),
  registrationDate: z.date().default(() => new Date()),
  adviserApproved: z.boolean().default(false),
  hodApproved: z.boolean().default(false),
  status: z.enum(["Pending", "Approved", "Rejected"]).default("Pending"),
});

interface CourseRegistrationFormProps {
  mode: "create" | "update";
  courseRegistration?: z.infer<typeof courseRegistrationSchema>;
  onSubmit?: (data: z.infer<typeof courseRegistrationSchema>) => Promise<void>;
}

export const CourseRegistrationForm = ({
  mode,
  courseRegistration,
  onSubmit,
}: CourseRegistrationFormProps) => {
  const createMutation = useMutation(
    orpc.courseRegistrations.create.mutationOptions()
  );
  const updateMutation = useMutation(
    orpc.courseRegistrations.update.mutationOptions()
  );
  const form = useForm({
    defaultValues: courseRegistration || {
      studentId: "",
      courseId: "",
      sessionId: "",
      semester: "First" as const,
      registrationType: "Normal" as const,
      registrationDate: new Date(),
      adviserApproved: false,
      hodApproved: false,
      status: "Pending" as const,
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
            await updateMutation.mutateAsync({
              ...value,
              id: `${courseRegistration?.id}`,
            });
            toast.success("Record updated successfully");
          }
        }
      } catch (error: any) {
        toast.error(error.message || "An error occurred");
      }
    },
  });

  useEffect(() => {
    if (mode === "update" && courseRegistration) form.reset(courseRegistration);
  }, [courseRegistration, mode]);

  const semesters = ["First", "Second"];
  const registrationTypes = ["Normal", "Carry Over", "Spillover"];
  const statusOptions = ["Pending", "Approved", "Rejected"];

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>
          {mode === "create" ? "Register Course" : "Update Course Registration"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="space-y-6"
        >
          <div className="grid grid-cols-2 gap-4">
            <form.Field
              name="studentId"
              validators={{
                onChange: courseRegistrationSchema.shape.studentId,
              }}
            >
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
            <form.Field
              name="courseId"
              validators={{ onChange: courseRegistrationSchema.shape.courseId }}
            >
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
          </div>
          <form.Field
            name="sessionId"
            validators={{ onChange: courseRegistrationSchema.shape.sessionId }}
          >
            {(field) => (
              <div className="space-y-2">
                <Label>Session ID *</Label>
                <Input
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </div>
            )}
          </form.Field>
          <div className="grid grid-cols-3 gap-4">
            <form.Field name="semester">
              {(field) => (
                <div className="space-y-2">
                  <Label>Semester *</Label>
                  <Select
                    value={field.state.value}
                    onValueChange={(e) =>
                      field.handleChange(e as "First" | "Second")
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select semester" />
                    </SelectTrigger>
                    <SelectContent>
                      {semesters.map((sem) => (
                        <SelectItem key={sem} value={sem}>
                          {sem}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </form.Field>
            <form.Field name="registrationType">
              {(field) => (
                <div className="space-y-2">
                  <Label>Registration Type *</Label>
                  <Select
                    value={field.state.value}
                    onValueChange={(e) =>
                      field.handleChange(
                        e as "Normal" | "Carry Over" | "Spillover"
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {registrationTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
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
                  <Select
                    value={field.state.value}
                    onValueChange={(e) =>
                      field.handleChange(
                        e as "Pending" | "Approved" | "Rejected"
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </form.Field>
          </div>
          <form.Field name="registrationDate">
            {(field) => (
              <div className="space-y-2">
                <Label>Registration Date *</Label>
                <Input
                  type="date"
                  value={field.state.value?.toISOString().split("T")[0]}
                  onChange={(e) => field.handleChange(new Date(e.target.value))}
                />
              </div>
            )}
          </form.Field>
          <div className="flex items-center space-x-4">
            <form.Field name="adviserApproved">
              {(field) => (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={field.state.value}
                    onCheckedChange={(e) => field.handleChange(Boolean(e))}
                  />
                  <Label>Adviser Approved</Label>
                </div>
              )}
            </form.Field>
            <form.Field name="hodApproved">
              {(field) => (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={field.state.value}
                    onCheckedChange={(e) => field.handleChange(Boolean(e))}
                  />
                  <Label>HOD Approved</Label>
                </div>
              )}
            </form.Field>
          </div>
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
            >
              {mode === "create" ? "Clear Form" : "Cancel"}
            </Button>
            <Button type="submit">
              {mode === "create" ? "Register Course" : "Update Registration"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export const CourseRegistrationForStudentForm = ({
  mode,
  courseRegistration,
  onSubmit,
}: CourseRegistrationFormProps) => {
  const createMutation = useMutation(
    orpc.courseRegistrations.create.mutationOptions({
      onSuccess: () => {
        toast.success("Record created successfully");
        queryClient.invalidateQueries({
          queryKey: orpc.courseRegistrations.create.key(),
        });
        form.reset();
      },
      onError: (err) => {
        toast.error(err.message || "An error occurred");
      },
    })
  );
  const updateMutation = useMutation(
    orpc.courseRegistrations.update.mutationOptions({
      onSuccess: () => {
        toast.success("Record updated successfully");

        queryClient.invalidateQueries({
          queryKey: orpc.courseRegistrations.update.key(),
        });
        form.reset();
      },
      onError: (err) => {
        toast.error(err.message || "An error occurred");
      },
    })
  );

  const { data: user, isPending } = useUser();

  const form = useAppForm({
    defaultValues: courseRegistration || {
      studentId: `${user?.data?.user.id}`,
      courseId: "",
      sessionId: "",
      semester: "First" as const,
      registrationType: "Normal" as const,
      registrationDate: new Date(),
      adviserApproved: false,
      hodApproved: false,
      status: "Pending" as const,
    },
    onSubmit: async ({ value }) => {
      if (onSubmit) {
        await onSubmit(value);
      } else {
        if (mode === "create") {
          await createMutation.mutateAsync(value);
        } else {
          await updateMutation.mutateAsync({
            ...value,
            id: `${courseRegistration?.id}`,
          });
        }
      }
    },
  });

  useEffect(() => {
    if (mode === "update" && courseRegistration) form.reset(courseRegistration);
  }, [courseRegistration, mode]);

  const semesters = ["First", "Second"];
  const registrationTypes = ["Normal", "Carry Over", "Spillover"];

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>
          {mode === "create" ? "Register Course" : "Update Course Registration"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="space-y-6"
        >
          <div className="grid grid-cols-2 gap-4">
            <form.AppField
              name="courseId"
              validators={{ onChange: courseRegistrationSchema.shape.courseId }}
            >
              {(field) => <field.CourseField />}
            </form.AppField>
            <form.AppField
              name="sessionId"
              validators={{
                onChange: courseRegistrationSchema.shape.sessionId,
              }}
            >
              {(field) => <field.AcademicSessionField />}
            </form.AppField>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <form.Field name="semester">
              {(field) => (
                <div className="space-y-2">
                  <Label>Semester *</Label>
                  <Select
                    value={field.state.value}
                    onValueChange={(e) =>
                      field.handleChange(e as "First" | "Second")
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select semester" />
                    </SelectTrigger>
                    <SelectContent>
                      {semesters.map((sem) => (
                        <SelectItem key={sem} value={sem}>
                          {sem}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </form.Field>
            <form.Field name="registrationType">
              {(field) => (
                <div className="space-y-2">
                  <Label>Registration Type *</Label>
                  <Select
                    value={field.state.value}
                    onValueChange={(e) =>
                      field.handleChange(
                        e as "Normal" | "Carry Over" | "Spillover"
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {registrationTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </form.Field>
          </div>

          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
            >
              {mode === "create" ? "Clear Form" : "Cancel"}
            </Button>
            <Button
              disabled={isPending || form.state.isSubmitting}
              type="submit"
            >
              {mode === "create" ? "Register Course" : "Update Registration"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
