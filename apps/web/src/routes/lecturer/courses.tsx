import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CoursesTable } from "@/components/tables";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { CourseForm } from "@/components/forms";

export const Route = createFileRoute("/lecturer/courses")({
  component: LecturerCoursesPage,
});

function LecturerCoursesPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Courses</h1>
          <p className="text-muted-foreground">Manage your assigned courses</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Course
            </Button>
          </DialogTrigger>
          <DialogContent>
            <CourseForm mode="create" />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assigned Courses</CardTitle>
        </CardHeader>
        <CardContent>
          <CoursesTable />
        </CardContent>
      </Card>
    </div>
  );
}
