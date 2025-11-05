import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FacultiesTable } from "@/components/tables";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { FacultyForm } from "@/components/forms/faculty";
import { orpc } from "@/utils/orpc";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

export const Route = createFileRoute("/admin/faculties")({
  component: FacultiesPage,
});

function FacultiesPage() {
  const { data: faculties } = useQuery(orpc.faculties.getAll.queryOptions());
  const { data: departments } = useQuery(
    orpc.departments.getAll.queryOptions()
  );
  const { data: users } = useQuery(orpc.users.getAll.queryOptions());
  const [open, onOpenChange] = useState(false);

  const totalFaculties = faculties?.length || 0;
  const activeFaculties = faculties?.filter((f) => f.isActive)?.length || 0;
  const totalDepartments = departments?.length || 0;
  const totalStudents =
    users?.filter((u) => u.userType === "student")?.length || 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Faculty Management</h1>
          <p className="text-muted-foreground">
            Manage faculties and departments
          </p>
        </div>
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogTrigger>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Faculty
            </Button>
          </DialogTrigger>
          <DialogContent>
            <FacultyForm mode="create" />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Faculties</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFaculties}</div>
            <p className="text-sm text-muted-foreground">
              {activeFaculties} active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Departments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDepartments}</div>
            <p className="text-sm text-muted-foreground">
              Across all faculties
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalStudents.toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground">Enrolled students</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Faculties</CardTitle>
        </CardHeader>
        <CardContent>
          <FacultiesTable />
        </CardContent>
      </Card>
    </div>
  );
}
