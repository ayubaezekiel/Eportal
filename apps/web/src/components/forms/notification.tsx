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
import { Checkbox } from "../ui/checkbox";

const notificationSchema = z.object({
  id: z.string().uuid().optional(),
  userId: z.string().uuid(),
  title: z.string().min(2),
  message: z.string().min(10),
  type: z.enum(["info", "success", "warning", "error"]),
  category: z.enum(["payment", "result", "registration", "announcement"]).optional(),
  isRead: z.boolean().default(false),
  actionUrl: z.string().optional(),
});

interface NotificationFormProps {
  mode: "create" | "update";
  notification?: z.infer<typeof notificationSchema>;
  onSubmit?: (data: z.infer<typeof notificationSchema>) => Promise<void>;
}

export const NotificationForm = ({ mode, notification, onSubmit }: NotificationFormProps) => {
  const createMutation = useMutation(orpc.notifications.create.mutationOptions());  const updateMutation = useMutation(orpc.notifications.update.mutationOptions());
  const form = useForm({
    defaultValues: notification || {
      userId: "",
      title: "",
      message: "",
      type: "info",
      category: undefined,
      isRead: false,
      actionUrl: "",
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
    if (mode === "update" && notification) form.reset(notification);
  }, [notification, mode]);

  const types = ["info", "success", "warning", "error"];
  const categories = ["payment", "result", "registration", "announcement"];

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>
          {mode === "create" ? "Create Notification" : "Update Notification"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit(); }} className="space-y-6">
          <form.Field name="userId" validators={{ onChange: notificationSchema.shape.userId }}>
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
          <form.Field name="title" validators={{ onChange: notificationSchema.shape.title }}>
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
          <form.Field name="message" validators={{ onChange: notificationSchema.shape.message }}>
            {(field) => (
              <div className="space-y-2">
                <Label>Message *</Label>
                <Textarea
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  rows={4}
                />
              </div>
            )}
          </form.Field>
          <div className="grid grid-cols-2 gap-4">
            <form.Field name="type">
              {(field) => (
                <div className="space-y-2">
                  <Label>Type *</Label>
                  <Select value={field.state.value} onValueChange={field.handleChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {types.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </form.Field>
            <form.Field name="category">
              {(field) => (
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={field.state.value || ""} onValueChange={(value) => field.handleChange(value || undefined)}>
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
          </div>
          <form.Field name="actionUrl">
            {(field) => (
              <div className="space-y-2">
                <Label>Action URL</Label>
                <Input
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </div>
            )}
          </form.Field>
          <form.Field name="isRead">
            {(field) => (
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={field.state.value}
                  onCheckedChange={field.handleChange}
                />
                <Label>Mark as Read</Label>
              </div>
            )}
          </form.Field>
          <div className="flex gap-4">
            <Button type="button" variant="outline" onClick={() => form.reset()}>
              {mode === "create" ? "Clear Form" : "Cancel"}
            </Button>
            <Button type="submit">
              {mode === "create" ? "Create Notification" : "Update Notification"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
