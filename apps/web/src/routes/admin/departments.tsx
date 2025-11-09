import { createFileRoute, redirect } from "@tanstack/react-router";
import { getUser } from "@/functions/get-user";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DepartmentsTable } from "@/components/tables";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { DepartmentForm } from "@/components/forms";

export const Route = createFileRoute("/admin/departments")({
  component: DepartmentsPage,
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

function DepartmentsPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Department Management</h1>
          <p className="text-muted-foreground">Manage all departments</p>
        </div>
        <Dialog>
          <DialogTrigger>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Department
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DepartmentForm mode="create" />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Departments</CardTitle>
        </CardHeader>
        <CardContent>
          <DepartmentsTable />
        </CardContent>
      </Card>
    </div>
  );
}
