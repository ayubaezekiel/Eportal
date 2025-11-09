import { createFileRoute, redirect } from "@tanstack/react-router";
import { getUser } from "@/functions/get-user";
import { PermissionGuard, usePermission } from "@/components/auth/permission-guard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ResultsTable } from "@/components/tables";
import { Plus, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ResultForm } from "@/components/forms";

export const Route = createFileRoute("/lecturer/results")({
  component: LecturerResultsPage,
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

function LecturerResultsPage() {
  const canViewResults = usePermission("view", "results");
  const canCreateResults = usePermission("create", "results");

  if (!canViewResults) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">Access Denied</h3>
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
          <h1 className="text-3xl font-bold">Student Results</h1>
          <p className="text-muted-foreground">Enter and manage student results</p>
        </div>
        <PermissionGuard action="create" resource="results">
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Result
              </Button>
            </DialogTrigger>
            <DialogContent>
              <ResultForm mode="create" />
            </DialogContent>
          </Dialog>
        </PermissionGuard>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Course Results</CardTitle>
        </CardHeader>
        <CardContent>
          <PermissionGuard action="view" resource="results">
            <ResultsTable />
          </PermissionGuard>
        </CardContent>
      </Card>
    </div>
  );
}
