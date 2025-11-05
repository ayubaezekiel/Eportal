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

const feeStructureSchema = z.object({
  id: z.string().uuid().optional(),
  sessionId: z.string().uuid(),
  programmeId: z.string().uuid(),
  level: z.number().min(100).max(900),
  studyMode: z.enum(["Full Time", "Part Time", "Sandwich"]),
  tuitionFee: z.number().min(0),
  developmentLevy: z.number().min(0).optional(),
  libraryFee: z.number().min(0).optional(),
  sportsFee: z.number().min(0).optional(),
  medicalFee: z.number().min(0).optional(),
  examFee: z.number().min(0).optional(),
  totalAmount: z.number().min(0),
  isActive: z.boolean().default(true),
});

interface FeeStructureFormProps {
  mode: "create" | "update";
  feeStructure?: z.infer<typeof feeStructureSchema>;
  onSubmit?: (data: z.infer<typeof feeStructureSchema>) => Promise<void>;
}

export const FeeStructureForm = ({ mode, feeStructure, onSubmit }: FeeStructureFormProps) => {
  const createMutation = useMutation(orpc.feeStructures.create.mutationOptions());  const updateMutation = useMutation(orpc.feeStructures.update.mutationOptions());
  const form = useForm({
    defaultValues: feeStructure || {
      sessionId: "",
      programmeId: "",
      level: 100,
      studyMode: "Full Time",
      tuitionFee: 0,
      developmentLevy: 0,
      libraryFee: 0,
      sportsFee: 0,
      medicalFee: 0,
      examFee: 0,
      totalAmount: 0,
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
    if (mode === "update" && feeStructure) form.reset(feeStructure);
  }, [feeStructure, mode]);

  const studyModes = ["Full Time", "Part Time", "Sandwich"];
  const levels = [100, 200, 300, 400, 500, 600, 700, 800, 900];

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>
          {mode === "create" ? "Create Fee Structure" : "Update Fee Structure"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit(); }} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <form.Field name="sessionId" validators={{ onChange: feeStructureSchema.shape.sessionId }}>
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
            <form.Field name="programmeId" validators={{ onChange: feeStructureSchema.shape.programmeId }}>
              {(field) => (
                <div className="space-y-2">
                  <Label>Programme ID *</Label>
                  <Input
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <form.Field name="level">
              {(field) => (
                <div className="space-y-2">
                  <Label>Level *</Label>
                  <Select value={field.state.value.toString()} onValueChange={(value) => field.handleChange(Number(value))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      {levels.map((level) => (
                        <SelectItem key={level} value={level.toString()}>{level}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </form.Field>
            <form.Field name="studyMode">
              {(field) => (
                <div className="space-y-2">
                  <Label>Study Mode *</Label>
                  <Select value={field.state.value} onValueChange={field.handleChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select mode" />
                    </SelectTrigger>
                    <SelectContent>
                      {studyModes.map((mode) => (
                        <SelectItem key={mode} value={mode}>{mode}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </form.Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <form.Field name="tuitionFee" validators={{ onChange: feeStructureSchema.shape.tuitionFee }}>
              {(field) => (
                <div className="space-y-2">
                  <Label>Tuition Fee *</Label>
                  <Input
                    type="number"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(Number(e.target.value))}
                  />
                </div>
              )}
            </form.Field>
            <form.Field name="developmentLevy">
              {(field) => (
                <div className="space-y-2">
                  <Label>Development Levy</Label>
                  <Input
                    type="number"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(Number(e.target.value))}
                  />
                </div>
              )}
            </form.Field>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <form.Field name="libraryFee">
              {(field) => (
                <div className="space-y-2">
                  <Label>Library Fee</Label>
                  <Input
                    type="number"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(Number(e.target.value))}
                  />
                </div>
              )}
            </form.Field>
            <form.Field name="sportsFee">
              {(field) => (
                <div className="space-y-2">
                  <Label>Sports Fee</Label>
                  <Input
                    type="number"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(Number(e.target.value))}
                  />
                </div>
              )}
            </form.Field>
            <form.Field name="medicalFee">
              {(field) => (
                <div className="space-y-2">
                  <Label>Medical Fee</Label>
                  <Input
                    type="number"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(Number(e.target.value))}
                  />
                </div>
              )}
            </form.Field>
          </div>
          <form.Field name="totalAmount" validators={{ onChange: feeStructureSchema.shape.totalAmount }}>
            {(field) => (
              <div className="space-y-2">
                <Label>Total Amount *</Label>
                <Input
                  type="number"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(Number(e.target.value))}
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
              {mode === "create" ? "Create Fee Structure" : "Update Fee Structure"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
