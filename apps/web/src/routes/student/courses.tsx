import { CourseRegistrationForStudentForm } from "@/components/forms/course-registration";
import { StudentCoursesTable } from "@/components/tables/course-registration-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/student/courses")({
  component: StudentCoursesPage,
});

function StudentCoursesPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">My Courses</h1>
          <p className="text-muted-foreground">
            View and manage your registered courses
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Register Course
            </Button>
          </DialogTrigger>
          <DialogContent>
            <CourseRegistrationForStudentForm mode="create" />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registered Courses</CardTitle>
        </CardHeader>
        <CardContent>
          <StudentCoursesTable />
        </CardContent>
      </Card>
    </div>
  );
}
