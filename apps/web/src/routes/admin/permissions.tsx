// apps/web/src/routes/admin/permissions.tsx

import { PermissionGuard } from "@/components/auth/permission-guard";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { rolePermissions, type UserRole } from "@/lib/rbac";
import { createFileRoute } from "@tanstack/react-router";

// Create the file route and protect it with the PermissionGuard
export const Route = createFileRoute("/admin/permissions")({
  component: () => (
    <PermissionGuard permission="permission:read" fallback={<PermissionsDenied />}>
      <PermissionsPage />
    </PermissionGuard>
  ),
});

const PermissionsDenied = () => (
  <Card className="w-full max-w-2xl mx-auto my-8">
    <CardHeader>
      <CardTitle>Permission Denied</CardTitle>
    </CardHeader>
    <CardContent>
      <p>You do not have permission to view this page.</p>
    </CardContent>
  </Card>
);

function PermissionsPage() {
  const roles = Object.keys(rolePermissions) as UserRole[];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Role Permissions Management</h1>
      <p className="text-muted-foreground mb-6">
        This is a read-only view of the permissions assigned to each role in the
        system.
      </p>

      <Card>
        <CardContent className="p-6">
          <Accordion type="single" collapsible className="w-full">
            {roles.map((role) => (
              <AccordionItem value={role} key={role}>
                <AccordionTrigger className="capitalize text-lg">
                  {role}
                  <Badge variant="outline" className="ml-4">
                    {rolePermissions[role].size} permissions
                  </Badge>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-wrap gap-2 p-4 bg-muted/50 rounded-md">
                    {Array.from(rolePermissions[role]).map((permission) => (
                      <Badge key={permission} variant="secondary">
                        {permission}
                      </Badge>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
