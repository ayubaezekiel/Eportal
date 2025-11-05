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

const hostelRoomSchema = z.object({
  id: z.string().uuid().optional(),
  hostelId: z.string().uuid(),
  roomNumber: z.string().min(1),
  roomType: z.enum(["Single", "Double", "Triple", "Quad"]),
  capacity: z.number().min(1),
  currentOccupancy: z.number().min(0),
  floor: z.number().min(0),
  isAvailable: z.boolean().default(true),
  isActive: z.boolean().default(true),
});

interface HostelRoomFormProps {
  mode: "create" | "update";
  room?: z.infer<typeof hostelRoomSchema>;
  onSubmit?: (data: z.infer<typeof hostelRoomSchema>) => Promise<void>;
}

export const HostelRoomForm = ({ mode, room, onSubmit }: HostelRoomFormProps) => {
  const createMutation = useMutation(orpc.hostelRooms.create.mutationOptions());  const updateMutation = useMutation(orpc.hostelRooms.update.mutationOptions());
  const form = useForm({
    defaultValues: room || {
      hostelId: "",
      roomNumber: "",
      roomType: "Double",
      capacity: 2,
      currentOccupancy: 0,
      floor: 1,
      isAvailable: true,
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
    if (mode === "update" && room) form.reset(room);
  }, [room, mode]);

  const roomTypes = ["Single", "Double", "Triple", "Quad"];

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>
          {mode === "create" ? "Create Room" : "Update Room"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit(); }} className="space-y-6">
          <form.Field name="hostelId" validators={{ onChange: hostelRoomSchema.shape.hostelId }}>
            {(field) => (
              <div className="space-y-2">
                <Label>Hostel ID *</Label>
                <Input
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </div>
            )}
          </form.Field>
          <div className="grid grid-cols-2 gap-4">
            <form.Field name="roomNumber" validators={{ onChange: hostelRoomSchema.shape.roomNumber }}>
              {(field) => (
                <div className="space-y-2">
                  <Label>Room Number *</Label>
                  <Input
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    disabled={mode === "update"}
                  />
                </div>
              )}
            </form.Field>
            <form.Field name="roomType">
              {(field) => (
                <div className="space-y-2">
                  <Label>Room Type *</Label>
                  <Select value={field.state.value} onValueChange={field.handleChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {roomTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </form.Field>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <form.Field name="capacity" validators={{ onChange: hostelRoomSchema.shape.capacity }}>
              {(field) => (
                <div className="space-y-2">
                  <Label>Capacity *</Label>
                  <Input
                    type="number"
                    min="1"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(Number(e.target.value))}
                  />
                </div>
              )}
            </form.Field>
            <form.Field name="currentOccupancy">
              {(field) => (
                <div className="space-y-2">
                  <Label>Current Occupancy</Label>
                  <Input
                    type="number"
                    min="0"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(Number(e.target.value))}
                  />
                </div>
              )}
            </form.Field>
            <form.Field name="floor">
              {(field) => (
                <div className="space-y-2">
                  <Label>Floor</Label>
                  <Input
                    type="number"
                    min="0"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(Number(e.target.value))}
                  />
                </div>
              )}
            </form.Field>
          </div>
          <div className="flex items-center space-x-4">
            <form.Field name="isAvailable">
              {(field) => (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={field.state.value}
                    onCheckedChange={field.handleChange}
                  />
                  <Label>Available</Label>
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
          </div>
          <div className="flex gap-4">
            <Button type="button" variant="outline" onClick={() => form.reset()}>
              {mode === "create" ? "Clear Form" : "Cancel"}
            </Button>
            <Button type="submit">
              {mode === "create" ? "Create Room" : "Update Room"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
