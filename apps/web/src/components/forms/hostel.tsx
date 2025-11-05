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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";

const hostelSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2),
  code: z.string().min(2),
  gender: z.enum(["Male", "Female", "Mixed"]),
  totalRooms: z.number().min(1),
  occupiedRooms: z.number().min(0),
  capacity: z.number().min(1),
  currentOccupancy: z.number().min(0),
  location: z.string().optional(),
  facilities: z.string().optional(),
  isActive: z.boolean().default(true),
});

interface HostelFormProps {
  mode: "create" | "update";
  hostel?: z.infer<typeof hostelSchema>;
  onSubmit?: (data: z.infer<typeof hostelSchema>) => Promise<void>;
}

export const HostelForm = ({ mode, hostel, onSubmit }: HostelFormProps) => {
  const createMutation = useMutation(orpc.hostels.create.mutationOptions());  const updateMutation = useMutation(orpc.hostels.update.mutationOptions());
  const form = useForm({
    defaultValues: hostel || {
      name: "",
      code: "",
      gender: "Mixed",
      totalRooms: 1,
      occupiedRooms: 0,
      capacity: 1,
      currentOccupancy: 0,
      location: "",
      facilities: "",
      isActive: true,
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
    if (mode === "update" && hostel) form.reset(hostel);
  }, [hostel, mode]);

  const genderOptions = ["Male", "Female", "Mixed"];

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>
          {mode === "create" ? "Create Hostel" : "Update Hostel"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit(); }} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <form.Field name="name" validators={{ onChange: hostelSchema.shape.name }}>
              {(field) => (
                <div className="space-y-2">
                  <Label>Hostel Name *</Label>
                  <Input
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>
            <form.Field name="code" validators={{ onChange: hostelSchema.shape.code }}>
              {(field) => (
                <div className="space-y-2">
                  <Label>Hostel Code *</Label>
                  <Input
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    disabled={mode === "update"}
                  />
                </div>
              )}
            </form.Field>
          </div>
          <form.Field name="gender">
            {(field) => (
              <div className="space-y-2">
                <Label>Gender *</Label>
                <Select value={field.state.value} onValueChange={field.handleChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    {genderOptions.map((gender) => (
                      <SelectItem key={gender} value={gender}>{gender}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </form.Field>
          <div className="grid grid-cols-2 gap-4">
            <form.Field name="totalRooms" validators={{ onChange: hostelSchema.shape.totalRooms }}>
              {(field) => (
                <div className="space-y-2">
                  <Label>Total Rooms *</Label>
                  <Input
                    type="number"
                    min="1"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(Number(e.target.value))}
                  />
                </div>
              )}
            </form.Field>
            <form.Field name="capacity" validators={{ onChange: hostelSchema.shape.capacity }}>
              {(field) => (
                <div className="space-y-2">
                  <Label>Total Capacity *</Label>
                  <Input
                    type="number"
                    min="1"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(Number(e.target.value))}
                  />
                </div>
              )}
            </form.Field>
          </div>
          <form.Field name="location">
            {(field) => (
              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </div>
            )}
          </form.Field>
          <form.Field name="facilities">
            {(field) => (
              <div className="space-y-2">
                <Label>Facilities</Label>
                <Textarea
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  rows={3}
                />
              </div>
            )}
          </form.Field>
          <form.Field name="isActive">
            {(field) => (
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={field.state.value}
                  onCheckedChange={field.handleChange}
                />
                <Label>Active</Label>
              </div>
            )}
          </form.Field>
          <div className="flex gap-4">
            <Button type="button" variant="outline" onClick={() => form.reset()}>
              {mode === "create" ? "Clear Form" : "Cancel"}
            </Button>
            <Button type="submit">
              {mode === "create" ? "Create Hostel" : "Update Hostel"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
