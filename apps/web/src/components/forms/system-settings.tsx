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

const systemSettingsSchema = z.object({
  id: z.string().uuid().optional(),
  settingKey: z.string(),
  settingValue: z.string(),
  description: z.string().optional(),
  category: z.string(),
  dataType: z.string().default("string"),
  isEditable: z.boolean().default(true),
  lastModifiedBy: z.string().uuid().optional(),
});

interface SystemSettingsFormProps {
  mode: "create" | "update";
  setting?: z.infer<typeof systemSettingsSchema>;
  onSubmit?: (data: z.infer<typeof systemSettingsSchema>) => Promise<void>;
}

export const SystemSettingsForm = ({ mode, setting, onSubmit }: SystemSettingsFormProps) => {
  const createMutation = useMutation(orpc.systemSettings.create.mutationOptions());  const updateMutation = useMutation(orpc.systemSettings.update.mutationOptions());
  const form = useForm({
    defaultValues: setting || {
      settingKey: "",
      settingValue: "",
      description: "",
      category: "",
      dataType: "string",
      isEditable: true,
      lastModifiedBy: "",
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
    if (mode === "update" && setting) form.reset(setting);
  }, [setting, mode]);

  const categories = ["general", "academic", "financial", "security", "notification"];
  const dataTypes = ["string", "number", "boolean", "json"];

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>
          {mode === "create" ? "Create System Setting" : "Update System Setting"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit(); }} className="space-y-6">
          <form.Field name="settingKey" validators={{ onChange: systemSettingsSchema.shape.settingKey }}>
            {(field) => (
              <div className="space-y-2">
                <Label>Setting Key *</Label>
                <Input
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  disabled={mode === "update"}
                />
              </div>
            )}
          </form.Field>
          <form.Field name="settingValue" validators={{ onChange: systemSettingsSchema.shape.settingValue }}>
            {(field) => (
              <div className="space-y-2">
                <Label>Setting Value *</Label>
                <Textarea
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  rows={3}
                />
              </div>
            )}
          </form.Field>
          <div className="grid grid-cols-2 gap-4">
            <form.Field name="category">
              {(field) => (
                <div className="space-y-2">
                  <Label>Category *</Label>
                  <Select value={field.state.value} onValueChange={field.handleChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </form.Field>
            <form.Field name="dataType">
              {(field) => (
                <div className="space-y-2">
                  <Label>Data Type *</Label>
                  <Select value={field.state.value} onValueChange={field.handleChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {dataTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </form.Field>
          </div>
          <form.Field name="description">
            {(field) => (
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  rows={3}
                />
              </div>
            )}
          </form.Field>
          <div className="flex gap-4">
            <Button type="button" variant="outline" onClick={() => form.reset()}>
              {mode === "create" ? "Clear Form" : "Cancel"}
            </Button>
            <Button type="submit">
              {mode === "create" ? "Create Setting" : "Update Setting"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
