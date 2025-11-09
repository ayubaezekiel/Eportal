import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUser } from "@/functions/get-user";
import { orpc } from "@/utils/orpc";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { Edit, Eye, Plus } from "lucide-react";

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

  const { data: courses = [] } = useQuery({
    ...orpc.courses.getAll.queryOptions(),
  });

  const departmentCourses = courses.filter(
    (c: any) => c.departmentId === session?.user.departmentId
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Department Courses</h1>
          <p className="text-muted-foreground">
            Manage your department's courses
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Eye className="mr-2 h-4 w-4" />
            View All
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Course
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Department Courses ({departmentCourses.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {departmentCourses.length > 0 ? (
            <div className="space-y-4">
              {departmentCourses.map((course) => (
                <div
                  key={course.id}
                  className="flex justify-between items-center p-4 border rounded-lg"
                >
                  <div>
                    <h4 className="font-medium">
                      {course.courseCode} - {course.courseTitle}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {course.creditUnits} units | Level {course.level} |{" "}
                      {course.semester} Semester
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">
              No courses found for your department.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
