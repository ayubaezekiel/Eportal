import { createFileRoute, redirect } from "@tanstack/react-router";
import { getUser } from "@/functions/get-user";
import { PermissionGuard, usePermission } from "@/components/auth/permission-guard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, UserPlus, Edit, Eye } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/hod/staff")({
  component: HODStaff,
  beforeLoad: async () => {
    const session = await getUser();
    return { session };
  },
  loader: async ({ context }) => {
    if (!context.session) {
      throw redirect({ to: "/login" });
    }
  },
});

function HODStaff() {
  const { session } = Route.useRouteContext();
  const canViewUsers = usePermission("view", "users");
  const canCreateUsers = usePermission("create", "users");
  const canUpdateUsers = usePermission("update", "users");

  const { data: users = [] } = useQuery({
    ...orpc.users.getAll.queryOptions(),
    enabled: canViewUsers,
  });

  const departmentStaff = users.filter((u: any) => 
    u.departmentId === session?.user.departmentId && 
    (u.userType === "lecturer" || u.userType === "hod")
  );

  if (!canViewUsers) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <Users className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold">Access Denied</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                You don't have permission to view staff.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Department Staff</h1>
          <p className="text-muted-foreground">Manage your department's staff members</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Eye className="mr-2 h-4 w-4" />
            View All
          </Button>
          <PermissionGuard action="create" resource="users">
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Staff
            </Button>
          </PermissionGuard>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Department Staff ({departmentStaff.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {departmentStaff.length > 0 ? (
            <div className="space-y-4">
              {departmentStaff.map((staff: any) => (
                <div key={staff.id} className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{staff.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {staff.email} | {staff.userType} | {staff.designation || 'N/A'}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <PermissionGuard action="update" resource="users">
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </PermissionGuard>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No staff members found for your department.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
