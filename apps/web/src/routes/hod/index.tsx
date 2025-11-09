import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { getUser } from "@/functions/get-user";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PermissionGuard, usePermission } from "@/components/auth/permission-guard";
import {
  Users,
  BookOpen,
  FileText,
  CheckCircle,
  BarChart3,
  GraduationCap,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/hod/")({
  component: HODDashboard,
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

function HODDashboard() {
  const { session } = Route.useRouteContext();
  const canViewUsers = usePermission("view", "users");
  const canViewResults = usePermission("view", "results");
  const canApproveResults = usePermission("approve", "results");

  const { data: courses } = useQuery(orpc.courses.getAll.queryOptions());
  const { data: users } = useQuery({
    ...orpc.users.getAll.queryOptions(),
    enabled: canViewUsers,
  });
  const { data: results } = useQuery({
    ...orpc.results.getAll.queryOptions(),
    enabled: canViewResults,
  });

  const departmentCourses = courses?.filter(c => c.departmentId === session?.user.departmentId) || [];
  const departmentStaff = users?.filter(u => u.departmentId === session?.user.departmentId) || [];
  const pendingResults = results?.filter(r => r.status === "Pending") || [];

  const quickActions = [
    { title: "Department Staff", icon: Users, href: "/hod/staff" },
    { title: "Course Management", icon: BookOpen, href: "/hod/courses" },
    { title: "Results Approval", icon: CheckCircle, href: "/hod/results" },
    { title: "Department Reports", icon: BarChart3, href: "/hod/reports" },
    { title: "Student Management", icon: GraduationCap, href: "/hod/students" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">HOD Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {session?.user.name}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Department Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{departmentCourses.length}</div>
          </CardContent>
        </Card>

        <PermissionGuard action="view" resource="users">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Department Staff</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{departmentStaff.length}</div>
            </CardContent>
          </Card>
        </PermissionGuard>

        <PermissionGuard action="approve" resource="results">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingResults.length}</div>
            </CardContent>
          </Card>
        </PermissionGuard>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Students</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {quickActions.map((action) => (
          <Card key={action.title} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <action.icon className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="font-semibold">{action.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    Manage department {action.title.toLowerCase()}
                  </p>
                </div>
              </div>
              <Link to={action.href} className="mt-4 block">
                <Button variant="outline" className="w-full">
                  Access
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      <PermissionGuard action="approve" resource="results">
        <Card>
          <CardHeader>
            <CardTitle>Recent Results Awaiting Approval</CardTitle>
          </CardHeader>
          <CardContent>
            {pendingResults.length > 0 ? (
              <div className="space-y-2">
                {pendingResults.slice(0, 5).map((result: any) => (
                  <div key={result.id} className="flex justify-between items-center p-2 border rounded">
                    <span className="text-sm">Course: {result.courseId}</span>
                    <Button size="sm" variant="outline">
                      Review
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No pending results</p>
            )}
          </CardContent>
        </Card>
      </PermissionGuard>
    </div>
  );
}
