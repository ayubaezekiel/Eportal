import { useForm } from "@tanstack/react-form";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";

interface Permission {
  id: string;
  action: string;
  resource: string;
  description?: string;
}

interface UserPermissionFormProps {
  userId: string;
}

export function UserPermissionForm({ userId }: UserPermissionFormProps) {
  const queryClient = useQueryClient();

  const { data: permissions = [] } = useQuery(
    orpc.permissions.getAll.queryOptions()
  );

  const { data: userRoles } = useQuery(
    orpc.roles.getAll.queryOptions({ input: {} })
  );

  const mutation = useMutation({
    mutationFn: (data: { roleIds: string[] }) =>
      api.patch(`/users/${userId}/roles`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-roles", userId] });
    },
  });

  const form = useForm({
    defaultValues: {
      roleIds: userRoles?.map((r: any) => r.roleId) || [],
    },
    onSubmit: async ({ value }) => {
      mutation.mutate({ roleIds: value.roleIds });
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assign Roles</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-6"
        >
          <div className="space-y-4">
            {["admin", "hod", "lecturer", "student"].map((roleName) => {
              const role = permissions.find((p) => p.resource === roleName);
              return (
                <form.Field
                  key={roleName}
                  name="roleIds"
                  children={(field) => (
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <Label
                          htmlFor={roleName}
                          className="text-base font-medium"
                        >
                          {roleName.charAt(0).toUpperCase() + roleName.slice(1)}
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          {getRoleDescription(roleName)}
                        </p>
                      </div>
                      <Switch
                        id={roleName}
                        checked={field.state.value.includes(roleName)}
                        onCheckedChange={(checked) => {
                          const current = field.state.value;
                          field.setValue(
                            checked
                              ? [...current, roleName]
                              : current.filter((id: string) => id !== roleName)
                          );
                        }}
                      />
                    </div>
                  )}
                />
              );
            })}
          </div>

          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Saving..." : "Save Permissions"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function getRoleDescription(role: string) {
  const desc: Record<string, string> = {
    admin: "Full access to all features",
    hod: "Manage department users, approve results",
    lecturer: "Upload results, mark attendance",
    student: "View personal results and fees",
  };
  return desc[role] || "";
}
