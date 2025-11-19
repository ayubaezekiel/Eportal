import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { getUser } from "@/functions/get-user";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Users,
  FileText,
  CheckSquare,
  BarChart3,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/lecturer/")({
  component: LecturerDashboard,
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

function LecturerDashboard() {
  const { session } = Route.useRouteContext();

  // Fetch real data with permission checks
  const { data: courses } = useQuery(orpc.courses.getAll.queryOptions());
  const { data: courseAllocations } = useQuery(
    orpc.courseAllocation.getAll.queryOptions()
  );
  const { data: courseRegistrations } = useQuery(
    orpc.courseRegistrations.getAll.queryOptions()
  );
  const { data: results } = useQuery({
    ...orpc.results.getAll.queryOptions(),
  });

  // Calculate lecturer-specific stats
  const lecturerCourses =
    courseAllocations?.filter((ca) => ca.lecturerId === session?.user.id) || [];
  const assignedCourseIds = lecturerCourses.map((lc) => lc.courseId);
  const lecturerCourseDetails =
    courses?.filter((c) => assignedCourseIds.includes(c.id)) || [];

  const totalStudents =
    courseRegistrations?.filter((cr) =>
      assignedCourseIds.includes(cr.courses.id)
    ).length || 0;

  const pendingResults =
    results?.filter(
      (r) =>
        assignedCourseIds.includes(r.results.courseId) &&
        r.results.status === "draft"
    ).length || 0;

  const quickActions = [
    { title: "My Courses", icon: BookOpen, href: "/lecturer/courses" },
    {
      title: "Mark Attendance",
      icon: CheckSquare,
      href: "/lecturer/attendance",
    },
    { title: "Enter Results", icon: FileText, href: "/lecturer/results" },
    { title: "View Students", icon: Users, href: "/lecturer/students" },
    { title: "Reports", icon: BarChart3, href: "/lecturer/reports" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Lecturer Portal</h1>
          <p className="text-muted-foreground">
            Welcome back, {session?.user.firstName} {session?.user.lastName}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3  gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Assigned Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lecturerCourses.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Pending Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingResults}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {quickActions.map((action) => (
                <Button
                  asChild
                  key={action.title}
                  variant="outline"
                  className="h-20 flex-col"
                >
                  <Link to={action.href}>
                    <action.icon className="h-6 w-6 mb-2" />
                    {action.title}
                  </Link>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Courses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {lecturerCourseDetails.length > 0 ? (
              lecturerCourseDetails.map((course) => {
                const studentCount =
                  courseRegistrations?.filter(
                    (cr) => cr.course_registrations.courseId === course.id
                  ).length || 0;
                return (
                  <div
                    key={course.id}
                    className="flex justify-between items-center p-3 border rounded"
                  >
                    <div>
                      <p className="font-medium">
                        {course?.courseCode} - {course?.courseTitle}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {studentCount} Students • {course.creditUnits} Credit
                        Units • Level {course.level}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button asChild size="sm" variant="outline">
                        <Link to="/lecturer/attendance">Attendance</Link>
                      </Button>
                      <Button asChild size="sm">
                        <Link to="/lecturer/results">Results</Link>
                      </Button>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-muted-foreground text-center py-4">
                No courses assigned
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
