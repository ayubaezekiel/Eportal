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

const senateDecisionSchema = z.object({
  id: z.string().uuid().optional(),
  meetingDate: z.date(),
  decisionType: z.string(),
  title: z.string(),
  description: z.string(),
  decision: z.string(),
  votesFor: z.number().default(0),
  votesAgainst: z.number().default(0),
  abstentions: z.number().default(0),
  status: z.string().default("approved"),
  implementationDate: z.date().optional(),
});

interface SenateDecisionFormProps {
  mode: "create" | "update";
  decision?: z.infer<typeof senateDecisionSchema>;
  onSubmit?: (data: z.infer<typeof senateDecisionSchema>) => Promise<void>;
}

export const SenateDecisionForm = ({ mode, decision, onSubmit }: SenateDecisionFormProps) => {
  const createMutation = useMutation(orpc.senateDecisions.create.mutationOptions());  const updateMutation = useMutation(orpc.senateDecisions.update.mutationOptions());
  const form = useForm({
    defaultValues: decision || {
      meetingDate: new Date(),
      decisionType: "",
      title: "",
      description: "",
      decision: "",
      votesFor: 0,
      votesAgainst: 0,
      abstentions: 0,
      status: "approved",
      implementationDate: undefined,
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
    if (mode === "update" && decision) form.reset(decision);
  }, [decision, mode]);

  const decisionTypes = ["policy", "academic", "administrative", "disciplinary", "financial"];
  const statusOptions = ["approved", "rejected", "deferred", "implemented"];

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>
          {mode === "create" ? "Record Senate Decision" : "Update Senate Decision"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit(); }} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <form.Field name="meetingDate">
              {(field) => (
                <div className="space-y-2">
                  <Label>Meeting Date *</Label>
                  <Input
                    type="date"
                    value={field.state.value?.toISOString().split('T')[0]}
                    onChange={(e) => field.handleChange(new Date(e.target.value))}
                  />
                </div>
              )}
            </form.Field>
            <form.Field name="decisionType">
              {(field) => (
                <div className="space-y-2">
                  <Label>Decision Type *</Label>
                  <Select value={field.state.value} onValueChange={field.handleChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {decisionTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </form.Field>
          </div>
          <form.Field name="title" validators={{ onChange: senateDecisionSchema.shape.title }}>
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
          <form.Field name="description" validators={{ onChange: senateDecisionSchema.shape.description }}>
            {(field) => (
              <div className="space-y-2">
                <Label>Description *</Label>
                <Textarea
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  rows={4}
                />
              </div>
            )}
          </form.Field>
          <div className="grid grid-cols-3 gap-4">
            <form.Field name="votesFor">
              {(field) => (
                <div className="space-y-2">
                  <Label>Votes For</Label>
                  <Input
                    type="number"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(Number(e.target.value))}
                  />
                </div>
              )}
            </form.Field>
            <form.Field name="votesAgainst">
              {(field) => (
                <div className="space-y-2">
                  <Label>Votes Against</Label>
                  <Input
                    type="number"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(Number(e.target.value))}
                  />
                </div>
              )}
            </form.Field>
            <form.Field name="abstentions">
              {(field) => (
                <div className="space-y-2">
                  <Label>Abstentions</Label>
                  <Input
                    type="number"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(Number(e.target.value))}
                  />
                </div>
              )}
            </form.Field>
          </div>
          <div className="flex gap-4">
            <Button type="button" variant="outline" onClick={() => form.reset()}>
              {mode === "create" ? "Clear Form" : "Cancel"}
            </Button>
            <Button type="submit">
              {mode === "create" ? "Record Decision" : "Update Decision"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
