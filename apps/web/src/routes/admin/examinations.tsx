import { createFileRoute, redirect } from "@tanstack/react-router";
import { getUser } from "@/functions/get-user";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExaminationsTable } from "@/components/tables/examinations-table";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ExaminationForm } from "@/components/forms";
import { PermissionGuard } from "@/components/auth/permission-guard";

export const Route = createFileRoute("/admin/examinations")({
  component: AdminExaminationsPage,
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

function AdminExaminationsPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Examination Schedule Management</h1>
          <p className="text-muted-foreground">Manage all examinations</p>
        </div>
        <PermissionGuard permission="examination:create">
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Schedule Examination
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Schedule New Examination</DialogTitle>
                <DialogDescription>
                  Fill out the form below to schedule a new examination.
                </DialogDescription>
              </DialogHeader>
              <ExaminationForm mode="create" />
            </DialogContent>
          </Dialog>
        </PermissionGuard>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Examinations</CardTitle>
        </CardHeader>
        <CardContent>
          <ExaminationsTable />
        </CardContent>
      </Card>
    </div>
  );
}
