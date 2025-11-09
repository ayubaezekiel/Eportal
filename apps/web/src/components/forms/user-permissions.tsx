import { useForm } from "@tanstack/react-form";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";

interface Role {
  id: string;
  name: string;
  description?: string;
}

interface UserPermissionFormProps {
  userId: string;
}

export function UserPermissionForm({ userId }: UserPermissionFormProps) {
  const queryClient = useQueryClient();

  const { data: allRoles = [] } = useQuery(orpc.roles.getAll.queryOptions());
  
  const { data: userRoles = [] } = useQuery(
    orpc.users.getRoles.queryOptions({ input: { userId } })
  );

  const mutation = useMutation({
    mutationFn: (data: { roleIds: string[] }) =>
      orpc.users.update.mutate({ input: { id: userId, roleIds: data.roleIds } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-roles", userId] });
    },
  });

  const currentRoleIds = userRoles.map((ur: any) => ur.role.id);

  const form = useForm({
    defaultValues: {
      roleIds: currentRoleIds,
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
            {allRoles.map((role: Role) => (
              <form.Field
                key={role.id}
                name="roleIds"
                children={(field) => (
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label
                        htmlFor={role.id}
                        className="text-base font-medium"
                      >
                        {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {role.description || getRoleDescription(role.name)}
                      </p>
                    </div>
                    <Switch
                      id={role.id}
                      checked={field.state.value.includes(role.id)}
                      onCheckedChange={(checked) => {
                        const current = field.state.value;
                        field.setValue(
                          checked
                            ? [...current, role.id]
                            : current.filter((id: string) => id !== role.id)
                        );
                      }}
                    />
                  </div>
                )}
              />
            ))}
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
  const descriptions: Record<string, string> = {
    admin: "Full access to all features",
    hod: "Manage department users, approve results",
    lecturer: "Upload results, mark attendance",
    student: "View personal results and fees",
  };
  return descriptions[role] || "";
}
