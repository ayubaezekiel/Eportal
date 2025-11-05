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
import { Textarea } from "../ui/textarea";

const alumniSchema = z.object({
  id: z.string().uuid().optional(),
  userId: z.string().uuid(),
  graduationYear: z.number(),
  degreeObtained: z.string(),
  currentEmployer: z.string().optional(),
  currentPosition: z.string().optional(),
  industry: z.string().optional(),
  linkedinProfile: z.string().optional(),
  achievements: z.string().optional(),
  willingToMentor: z.boolean().default(false),
  contactPreference: z.string().default("email"),
});

interface AlumniFormProps {
  mode: "create" | "update";
  alumni?: z.infer<typeof alumniSchema>;
  onSubmit?: (data: z.infer<typeof alumniSchema>) => Promise<void>;
}

export const AlumniForm = ({ mode, alumni, onSubmit }: AlumniFormProps) => {
  const createMutation = useMutation(orpc.alumni.create.mutationOptions());
  const updateMutation = useMutation(orpc.alumni.update.mutationOptions());
  const form = useForm({
    defaultValues: alumni || {
      userId: "",
      graduationYear: new Date().getFullYear(),
      degreeObtained: "",
      currentEmployer: "",
      currentPosition: "",
      industry: "",
      linkedinProfile: "",
      achievements: "",
      willingToMentor: false,
      contactPreference: "email",
    },
    onSubmit: async ({ value }) => {
      try {
        if (onSubmit) {
          await onSubmit(value);
        } else {
          if (mode === "create") {
            await createMutation.mutateAsync(value);
            toast.success("Alumni record created successfully");
            form.reset();
          } else {
            await updateMutation.mutateAsync({ ...value, id: `${value.id}` });
            toast.success("Alumni record updated successfully");
          }
        }
      } catch (error: any) {
        toast.error(error.message || "An error occurred");
      }
    },
  });

  useEffect(() => {
    if (mode === "update" && alumni) form.reset(alumni);
  }, [alumni, mode]);

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>
          {mode === "create" ? "Register Alumni" : "Update Alumni Profile"}
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
          <form.Field
            name="userId"
            validators={{ onChange: alumniSchema.shape.userId }}
          >
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
            <form.Field
              name="graduationYear"
              validators={{ onChange: alumniSchema.shape.graduationYear }}
            >
              {(field) => (
                <div className="space-y-2">
                  <Label>Graduation Year *</Label>
                  <Input
                    type="number"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(Number(e.target.value))}
                  />
                </div>
              )}
            </form.Field>
            <form.Field
              name="degreeObtained"
              validators={{ onChange: alumniSchema.shape.degreeObtained }}
            >
              {(field) => (
                <div className="space-y-2">
                  <Label>Degree Obtained *</Label>
                  <Input
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <form.Field name="currentEmployer">
              {(field) => (
                <div className="space-y-2">
                  <Label>Current Employer</Label>
                  <Input
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>
            <form.Field name="currentPosition">
              {(field) => (
                <div className="space-y-2">
                  <Label>Current Position</Label>
                  <Input
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>
          </div>
          <form.Field name="industry">
            {(field) => (
              <div className="space-y-2">
                <Label>Industry</Label>
                <Input
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </div>
            )}
          </form.Field>
          <form.Field name="achievements">
            {(field) => (
              <div className="space-y-2">
                <Label>Achievements</Label>
                <Textarea
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  rows={4}
                />
              </div>
            )}
          </form.Field>
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
            >
              {mode === "create" ? "Clear Form" : "Cancel"}
            </Button>
            <Button type="submit">
              {mode === "create" ? "Register Alumni" : "Update Profile"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
