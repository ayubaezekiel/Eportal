import { orpc, queryClient } from "@/utils/orpc";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";
import z from "zod";
import { useAppForm } from "../form";
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
import { Textarea } from "../ui/textarea";

const paymentSchema = z.object({
  id: z.string().uuid().optional(),
  studentId: z.string().uuid(),
  sessionId: z.string().uuid(),
  referenceNumber: z.string().min(1),
  amount: z.string(),
  paymentType: z.enum([
    "School Fees",
    "Acceptance Fee",
    "Late Registration",
    "Result Checking",
  ]),
  paymentMethod: z.enum(["Remita", "Bank Transfer", "Card", "Cash"]),
  status: z
    .enum(["Pending", "Confirmed", "Failed", "Reversed"])
    .default("Pending"),
  paymentDate: z.string(),
  description: z.string().optional(),
});

interface PaymentFormProps {
  mode: "create" | "update";
  payment?: z.infer<typeof paymentSchema>;
  onSubmit?: (data: z.infer<typeof paymentSchema>) => Promise<void>;
}

export const PaymentForm = ({ mode, payment, onSubmit }: PaymentFormProps) => {
  const createMutation = useMutation(
    orpc.payments.create.mutationOptions({
      onSuccess: () => {
        toast.success("Payment created successfully");
        queryClient.invalidateQueries({ queryKey: orpc.payments.create.key() });
        form.reset();
      },
    })
  );
  const updateMutation = useMutation(
    orpc.payments.update.mutationOptions({
      onSuccess: () => {
        toast.success("Payment updated successfully");
        queryClient.invalidateQueries({
          queryKey: orpc.payments.update.key(),
        });
        form.reset();
      },
    })
  );

  const form = useAppForm({
    defaultValues: payment || {
      studentId: "",
      sessionId: "",
      referenceNumber: "",
      amount: "0",
      paymentType: "School Fees" as
        | "School Fees"
        | "Acceptance Fee"
        | "Late Registration"
        | "Result Checking",
      paymentMethod: "Remita" as "Remita" | "Bank Transfer" | "Card" | "Cash",
      status: "Pending" as "Pending" | "Confirmed" | "Failed" | "Reversed",
      paymentDate: new Date().toISOString().split("T")[0],
      description: "",
    },
    onSubmit: async ({ value }) => {
      try {
        if (onSubmit) {
          await onSubmit(value);
        } else {
          if (mode === "create") {
            await createMutation.mutateAsync(value);
          } else {
            await updateMutation.mutateAsync({
              ...value,
              id: `${payment?.id}`,
            });
          }
        }
      } catch (error: any) {
        toast.error(error.message || "An error occurred");
      }
    },
  });

  useEffect(() => {
    if (mode === "update" && payment) form.reset(payment);
  }, [payment, mode]);

  const paymentTypes = [
    "School Fees",
    "Acceptance Fee",
    "Late Registration",
    "Result Checking",
  ] as const;
  const paymentMethods = ["Remita", "Bank Transfer", "Card", "Cash"] as const;
  const statusOptions = ["Pending", "Confirmed", "Failed", "Reversed"] as const;

  return (
    <Card className="max-w-3xl mx-auto mt-10">
      <CardHeader>
        <CardTitle>
          {mode === "create" ? "Record Payment" : "Update Payment"}
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
              name="studentId"
              validators={{ onChange: paymentSchema.shape.studentId }}
            >
              {(field) => <field.StudentField />}
            </form.AppField>
            <form.AppField
              name="sessionId"
              validators={{ onChange: paymentSchema.shape.sessionId }}
            >
              {(field) => <field.AcademicSessionField />}
            </form.AppField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <form.Field
              name="referenceNumber"
              validators={{ onChange: paymentSchema.shape.referenceNumber }}
            >
              {(field) => (
                <div className="space-y-2">
                  <Label>Reference Number *</Label>
                  <Input
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>
            <form.Field
              name="amount"
              validators={{ onChange: paymentSchema.shape.amount }}
            >
              {(field) => (
                <div className="space-y-2">
                  <Label>Amount *</Label>
                  <Input
                    type="number"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <form.Field name="paymentType">
              {(field) => (
                <div className="space-y-2">
                  <Label>Payment Type *</Label>
                  <Select
                    value={field.state.value}
                    onValueChange={(e) =>
                      field.handleChange(
                        e as
                          | "School Fees"
                          | "Acceptance Fee"
                          | "Late Registration"
                          | "Result Checking"
                      )
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </form.Field>
            <form.Field name="paymentMethod">
              {(field) => (
                <div className="space-y-2">
                  <Label>Payment Method *</Label>
                  <Select
                    value={field.state.value}
                    onValueChange={(e) =>
                      field.handleChange(
                        e as "Remita" | "Bank Transfer" | "Card" | "Cash"
                      )
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map((method) => (
                        <SelectItem key={method} value={method}>
                          {method}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </form.Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <form.Field name="paymentDate">
              {(field) => (
                <div className="space-y-2">
                  <Label>Payment Date *</Label>
                  <Input
                    type="date"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
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
                        e as "Pending" | "Confirmed" | "Failed" | "Reversed"
                      )
                    }
                  >
                    <SelectTrigger className="w-full">
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
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
            >
              {mode === "create" ? "Clear Form" : "Cancel"}
            </Button>
            <Button type="submit">
              {mode === "create" ? "Record Payment" : "Update Payment"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
