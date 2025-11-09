import { createFileRoute, redirect } from "@tanstack/react-router";
import { getUser } from "@/functions/get-user";
import { PermissionGuard, usePermission } from "@/components/auth/permission-guard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Plus, Edit, Eye } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/hod/courses")({
  component: HODCourses,
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

function HODCourses() {
  const { session } = Route.useRouteContext();
  const canViewCourses = usePermission("view", "courses");
  const canCreateCourses = usePermission("create", "courses");
  const canUpdateCourses = usePermission("update", "courses");

  const { data: courses = [] } = useQuery({
    ...orpc.courses.getAll.queryOptions(),
    enabled: canViewCourses,
  });

  const departmentCourses = courses.filter((c: any) => c.departmentId === session?.user.departmentId);

  if (!canViewCourses) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold">Access Denied</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                You don't have permission to view courses.
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
          <h1 className="text-3xl font-bold">Department Courses</h1>
          <p className="text-muted-foreground">Manage your department's courses</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Eye className="mr-2 h-4 w-4" />
            View All
          </Button>
          <PermissionGuard action="create" resource="courses">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Course
            </Button>
          </PermissionGuard>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Department Courses ({departmentCourses.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {departmentCourses.length > 0 ? (
            <div className="space-y-4">
              {departmentCourses.map((course: any) => (
                <div key={course.id} className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{course.courseCode} - {course.courseTitle}</h4>
                    <p className="text-sm text-muted-foreground">
                      {course.creditUnits} units | Level {course.level} | {course.semester} Semester
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <PermissionGuard action="update" resource="courses">
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </PermissionGuard>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No courses found for your department.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
