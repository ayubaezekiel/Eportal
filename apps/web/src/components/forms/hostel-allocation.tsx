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

const hostelAllocationSchema = z.object({
  id: z.string().uuid().optional(),
  studentId: z.string().uuid(),
  roomId: z.string().uuid(),
  sessionId: z.string().uuid(),
  allocationDate: z.date().default(() => new Date()),
  checkInDate: z.date().optional(),
  checkOutDate: z.date().optional(),
  status: z.enum(["Allocated", "Checked In", "Checked Out", "Cancelled"]).default("Allocated"),
  bedNumber: z.string().optional(),
});

interface HostelAllocationFormProps {
  mode: "create" | "update";
  allocation?: z.infer<typeof hostelAllocationSchema>;
  onSubmit?: (data: z.infer<typeof hostelAllocationSchema>) => Promise<void>;
}

export const HostelAllocationForm = ({ mode, allocation, onSubmit }: HostelAllocationFormProps) => {
  const createMutation = useMutation(orpc.hostelAllocations.create.mutationOptions());  const updateMutation = useMutation(orpc.hostelAllocations.update.mutationOptions());
  const form = useForm({
    defaultValues: allocation || {
      studentId: "",
      roomId: "",
      sessionId: "",
      allocationDate: new Date(),
      checkInDate: undefined,
      checkOutDate: undefined,
      status: "Allocated",
      bedNumber: "",
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
    if (mode === "update" && allocation) form.reset(allocation);
  }, [allocation, mode]);

  const statusOptions = ["Allocated", "Checked In", "Checked Out", "Cancelled"];

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>
          {mode === "create" ? "Allocate Room" : "Update Allocation"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit(); }} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <form.Field name="studentId" validators={{ onChange: hostelAllocationSchema.shape.studentId }}>
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
            <form.Field name="roomId" validators={{ onChange: hostelAllocationSchema.shape.roomId }}>
              {(field) => (
                <div className="space-y-2">
                  <Label>Room ID *</Label>
                  <Input
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>
          </div>
          <form.Field name="sessionId" validators={{ onChange: hostelAllocationSchema.shape.sessionId }}>
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
          <div className="grid grid-cols-2 gap-4">
            <form.Field name="allocationDate">
              {(field) => (
                <div className="space-y-2">
                  <Label>Allocation Date *</Label>
                  <Input
                    type="date"
                    value={field.state.value?.toISOString().split('T')[0]}
                    onChange={(e) => field.handleChange(new Date(e.target.value))}
                  />
                </div>
              )}
            </form.Field>
            <form.Field name="status">
              {(field) => (
                <div className="space-y-2">
                  <Label>Status *</Label>
                  <Select value={field.state.value} onValueChange={field.handleChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status} value={status}>{status}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </form.Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <form.Field name="checkInDate">
              {(field) => (
                <div className="space-y-2">
                  <Label>Check In Date</Label>
                  <Input
                    type="date"
                    value={field.state.value?.toISOString().split('T')[0] || ""}
                    onChange={(e) => field.handleChange(e.target.value ? new Date(e.target.value) : undefined)}
                  />
                </div>
              )}
            </form.Field>
            <form.Field name="checkOutDate">
              {(field) => (
                <div className="space-y-2">
                  <Label>Check Out Date</Label>
                  <Input
                    type="date"
                    value={field.state.value?.toISOString().split('T')[0] || ""}
                    onChange={(e) => field.handleChange(e.target.value ? new Date(e.target.value) : undefined)}
                  />
                </div>
              )}
            </form.Field>
          </div>
          <form.Field name="bedNumber">
            {(field) => (
              <div className="space-y-2">
                <Label>Bed Number</Label>
                <Input
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </div>
            )}
          </form.Field>
          <div className="flex gap-4">
            <Button type="button" variant="outline" onClick={() => form.reset()}>
              {mode === "create" ? "Clear Form" : "Cancel"}
            </Button>
            <Button type="submit">
              {mode === "create" ? "Allocate Room" : "Update Allocation"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
