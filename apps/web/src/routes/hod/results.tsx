import { createFileRoute, redirect } from "@tanstack/react-router";
import { getUser } from "@/functions/get-user";
import { PermissionGuard, usePermission } from "@/components/auth/permission-guard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, CheckCircle, Eye, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/hod/results")({
  component: HODResults,
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

function HODResults() {
  const canViewResults = usePermission("view", "results");
  const canApproveResults = usePermission("approve", "results");

  const { data: results = [] } = useQuery({
    ...orpc.results.getAll.queryOptions(),
    enabled: canViewResults,
  });

  const pendingResults = results.filter((r: any) => r.status === "Pending");
  const approvedResults = results.filter((r: any) => r.status === "Approved");

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
          <h1 className="text-3xl font-bold">Department Results</h1>
          <p className="text-muted-foreground">Approve and manage department results</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Eye className="mr-2 h-4 w-4" />
            View All
          </Button>
          <PermissionGuard action="approve" resource="results">
            <Button>
              <CheckCircle className="mr-2 h-4 w-4" />
              Bulk Approve
            </Button>
          </PermissionGuard>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{pendingResults.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{approvedResults.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Results</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{results.length}</div>
          </CardContent>
        </Card>
      </div>

      <PermissionGuard action="approve" resource="results">
        <Card>
          <CardHeader>
            <CardTitle>Results Awaiting Approval</CardTitle>
          </CardHeader>
          <CardContent>
            {pendingResults.length > 0 ? (
              <div className="space-y-4">
                {pendingResults.map((result: any) => (
                  <div key={result.id} className="flex justify-between items-center p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Course: {result.courseId}</h4>
                      <p className="text-sm text-muted-foreground">
                        Student: {result.studentId} | Total: {result.totalScore}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        Review
                      </Button>
                      <Button size="sm">
                        Approve
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No results pending approval</p>
            )}
          </CardContent>
        </Card>
      </PermissionGuard>

      <Card>
        <CardHeader>
          <CardTitle>Department Results Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Overview of all results in your department.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
