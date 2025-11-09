import { createFileRoute, redirect } from "@tanstack/react-router";
import { getUser } from "@/functions/get-user";
import { PermissionGuard, usePermission } from "@/components/auth/permission-guard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Eye, CheckCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/dean/results")({
  component: DeanResults,
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

function DeanResults() {
  const canViewResults = usePermission("view", "results");
  const canApproveResults = usePermission("approve", "results");

  const { data: results = [] } = useQuery({
    ...orpc.results.getAll.queryOptions(),
    enabled: canViewResults,
  });

  if (!canViewResults) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold">Access Denied</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                You don't have permission to view results.
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
          <h1 className="text-3xl font-bold">Faculty Results</h1>
          <p className="text-muted-foreground">Monitor and oversee faculty results</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Eye className="mr-2 h-4 w-4" />
            View All Results
          </Button>
          <PermissionGuard action="approve" resource="results">
            <Button>
              <CheckCircle className="mr-2 h-4 w-4" />
              Approve Results
            </Button>
          </PermissionGuard>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Faculty Results Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Results from all departments in your faculty will appear here.
            </p>
          </CardContent>
        </Card>

        <PermissionGuard action="approve" resource="results">
          <Card>
            <CardHeader>
              <CardTitle>Results Requiring Approval</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Results pending your approval as Dean.
              </p>
            </CardContent>
          </Card>
        </PermissionGuard>
      </div>
    </div>
  );
}
