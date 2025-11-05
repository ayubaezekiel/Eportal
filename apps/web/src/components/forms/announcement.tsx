import { orpc } from "@/utils/orpc";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";
import z from "zod";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Checkbox } from "../ui/checkbox";
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

const announcementSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(2),
  content: z.string().min(10),
  category: z.enum([
    "Academic",
    "Administrative",
    "Events",
    "Exams",
    "General",
  ]),
  priority: z.enum(["Low", "Normal", "High", "Urgent"]).default("Normal"),
  publishDate: z.date().default(() => new Date()),
  expiryDate: z.date().optional(),
  isPinned: z.boolean().default(false),
  isActive: z.boolean().default(true),
  publishedBy: z.string().uuid(),
});

interface AnnouncementFormProps {
  mode: "create" | "update";
  announcement?: z.infer<typeof announcementSchema>;
  onSubmit?: (data: z.infer<typeof announcementSchema>) => Promise<void>;
}

export const AnnouncementForm = ({
  mode,
  announcement,
  onSubmit,
}: AnnouncementFormProps) => {
  const createMutation = useMutation(
    orpc.announcements.create.mutationOptions()
  );
  const updateMutation = useMutation(
    orpc.announcements.update.mutationOptions()
  );
  const form = useForm({
    defaultValues: announcement || {
      title: "",
      content: "",
      category: "General" as const,
      priority: "Normal" as const,
      publishDate: new Date(),
      expiryDate: undefined,
      isPinned: false,
      isActive: true,
      publishedBy: "",
    },
    onSubmit: async ({ value }) => {
      try {
        if (onSubmit) {
          await onSubmit(value);
        } else {
          if (mode === "create") {
            await createMutation.mutateAsync(value);
            toast.success("Announcement created successfully");
            form.reset();
          } else {
            await updateMutation.mutateAsync({ ...value, id: `${value.id}` });
            toast.success("Announcement updated successfully");
          }
        }
      } catch (error: any) {
        toast.error(error.message || "An error occurred");
      }
    },
  });

  useEffect(() => {
    if (mode === "update" && announcement) form.reset(announcement);
  }, [announcement, mode]);

  const categories = [
    "Academic",
    "Administrative",
    "Events",
    "Exams",
    "General",
  ];
  const priorities = ["Low", "Normal", "High", "Urgent"];

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>
          {mode === "create" ? "Create Announcement" : "Update Announcement"}
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
            name="title"
            validators={{ onChange: announcementSchema.shape.title }}
          >
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
          <form.Field
            name="content"
            validators={{ onChange: announcementSchema.shape.content }}
          >
            {(field) => (
              <div className="space-y-2">
                <Label>Content *</Label>
                <Textarea
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  rows={6}
                />
              </div>
            )}
          </form.Field>
          <div className="grid grid-cols-2 gap-4">
            <form.Field name="category">
              {(field) => (
                <div className="space-y-2">
                  <Label>Category *</Label>
                  <Select
                    value={field.state.value}
                    onValueChange={(e) =>
                      field.handleChange(
                        e as
                          | "Academic"
                          | "Administrative"
                          | "Events"
                          | "Exams"
                          | "General"
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </form.Field>
            <form.Field name="priority">
              {(field) => (
                <div className="space-y-2">
                  <Label>Priority *</Label>
                  <Select
                    value={field.state.value}
                    onValueChange={(e) =>
                      field.handleChange(
                        e as "Low" | "Normal" | "High" | "Urgent"
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      {priorities.map((priority) => (
                        <SelectItem key={priority} value={priority}>
                          {priority}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </form.Field>
          </div>
          <form.Field
            name="publishedBy"
            validators={{ onChange: announcementSchema.shape.publishedBy }}
          >
            {(field) => (
              <div className="space-y-2">
                <Label>Published By *</Label>
                <Input
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </div>
            )}
          </form.Field>
          <div className="grid grid-cols-2 gap-4">
            <form.Field name="publishDate">
              {(field) => (
                <div className="space-y-2">
                  <Label>Publish Date *</Label>
                  <Input
                    type="date"
                    value={field.state.value?.toISOString().split("T")[0]}
                    onChange={(e) =>
                      field.handleChange(new Date(e.target.value))
                    }
                  />
                </div>
              )}
            </form.Field>
            <form.Field name="expiryDate">
              {(field) => (
                <div className="space-y-2">
                  <Label>Expiry Date</Label>
                  <Input
                    type="date"
                    value={field.state.value?.toISOString().split("T")[0] || ""}
                    onChange={(e) =>
                      field.handleChange(
                        e.target.value ? new Date(e.target.value) : undefined
                      )
                    }
                  />
                </div>
              )}
            </form.Field>
          </div>
          <div className="flex items-center space-x-4">
            <form.Field name="isPinned">
              {(field) => (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={field.state.value}
                    onCheckedChange={(e) => field.handleChange(Boolean(e))}
                  />
                  <Label>Pinned</Label>
                </div>
              )}
            </form.Field>
            <form.Field name="isActive">
              {(field) => (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={field.state.value}
                    onCheckedChange={(e) => field.handleChange(Boolean(e))}
                  />
                  <Label>Active</Label>
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
              {mode === "create"
                ? "Create Announcement"
                : "Update Announcement"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
