import { orpc, queryClient } from "@/utils/orpc";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import z from "zod";
import { Button } from "../ui/button";
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
import { useUser } from "@/hooks/auth";
import type { Announcement } from "@/types/types";

const announcementSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(5, "Title must be at least 5 characters"),
  content: z.string().min(10, "Content is required"),
  category: z.enum([
    "Academic",
    "Administrative",
    "Events",
    "Exams",
    "General",
  ]),
  priority: z.enum(["Low", "Normal", "High", "Urgent"]),
  publishDate: z.date(),
  expiryDate: z.date().optional(),
  isPinned: z.boolean(),
  isActive: z.boolean(),
  publishedBy: z.string().uuid().optional(),
});

type AnnouncementFormValues = z.infer<typeof announcementSchema>;

interface AnnouncementFormProps {
  mode: "create" | "update";
  announcement?: Announcement;
}

export const AnnouncementForm = ({
  mode,
  announcement,
}: AnnouncementFormProps) => {
  const { user } = useUser();

  const createMutation = useMutation(
    orpc.announcements.create.mutationOptions({
      onSuccess: () => {
        toast.success("Announcement created successfully");
        queryClient.invalidateQueries({
          queryKey: orpc.announcements.getAll.queryKey(),
        });
        form.reset();
      },
      onError: (err) => {
        toast.error(err.message || "Failed to create announcement");
      },
    })
  );

  const updateMutation = useMutation(
    orpc.announcements.update.mutationOptions({
      onSuccess: () => {
        toast.success("Announcement updated successfully");
        queryClient.invalidateQueries({
          queryKey: orpc.announcements.getAll.queryKey(),
        });
      },
      onError: (err) => {
        toast.error(err.message || "Failed to update announcement");
      },
    })
  );

  const form = useForm({
    defaultValues: announcement
      ? {
          ...announcement,
          publishDate: new Date(announcement.publishDate),
          expiryDate: announcement.expiryDate
            ? new Date(announcement.expiryDate)
            : undefined,
        }
      : {
          title: "",
          content: "",
          category: "General" as const,
          priority: "Normal" as const,
          publishDate: new Date(),
          expiryDate: undefined,
          isPinned: false,
          isActive: true,
        },
    onSubmit: async ({ value }) => {
      const dataWithUser = {
        ...value,
        publishedBy: user?.id,
      };
      if (mode === "create") {
        await createMutation.mutateAsync(dataWithUser);
      } else {
        if (!announcement?.id)
          throw new Error("Announcement ID is missing for update");
        await updateMutation.mutateAsync({
          ...dataWithUser,
          id: announcement.id,
        });
      }
    },
  });

  const categories = [
    "Academic",
    "Administrative",
    "Events",
    "Exams",
    "General",
  ];
  const priorities = ["Low", "Normal", "High", "Urgent"];

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-6 py-4"
    >
      <form.Field
        name="title"
        validators={{ onChange: announcementSchema.shape.title }}
        children={(field) => (
          <div className="space-y-1">
            <Label>Title *</Label>
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
        name="content"
        validators={{ onChange: announcementSchema.shape.content }}
        children={(field) => (
          <div className="space-y-1">
            <Label>Content *</Label>
            <Textarea
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              rows={6}
            />
          </div>
        )}
      />
      <div className="grid grid-cols-2 gap-4">
        <form.Field
          name="category"
          children={(field) => (
            <div className="space-y-1">
              <Label>Category *</Label>
              <Select
                value={field.state.value}
                onValueChange={field.handleChange}
              >
                <SelectTrigger>
                  <SelectValue />
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
        />
        <form.Field
          name="priority"
          children={(field) => (
            <div className="space-y-1">
              <Label>Priority *</Label>
              <Select
                value={field.state.value}
                onValueChange={field.handleChange}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <form.Field
          name="publishDate"
          children={(field) => (
            <div className="space-y-1">
              <Label>Publish Date</Label>
              <Input
                type="date"
                value={field.state.value?.toISOString().split("T")[0]}
                onChange={(e) => field.handleChange(new Date(e.target.value))}
              />
            </div>
          )}
        />
        <form.Field
          name="expiryDate"
          children={(field) => (
            <div className="space-y-1">
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
        />
      </div>

      <div className="flex items-center space-x-4">
        <form.Field
          name="isPinned"
          children={(field) => (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isPinned"
                checked={field.state.value}
                onCheckedChange={(checked) => field.handleChange(Boolean(checked))}
              />
              <Label htmlFor="isPinned">Pin Announcement</Label>
            </div>
          )}
        />
        <form.Field
          name="isActive"
          children={(field) => (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isActive"
                checked={field.state.value}
                onCheckedChange={(checked) => field.handleChange(Boolean(checked))}
              />
              <Label htmlFor="isActive">Is Active</Label>
            </div>
          )}
        />
      </div>

      <div className="flex justify-end gap-4 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={() => form.reset()}
          disabled={createMutation.isPending || updateMutation.isPending}
        >
          Reset
        </Button>
        <Button
          type="submit"
          disabled={createMutation.isPending || updateMutation.isPending}
        >
          {createMutation.isPending || updateMutation.isPending
            ? "Saving..."
            : mode === "create"
            ? "Create Announcement"
            : "Update Announcement"}
        </Button>
      </div>
    </form>
  );
};
