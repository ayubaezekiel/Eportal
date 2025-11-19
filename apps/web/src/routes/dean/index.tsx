import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUser } from "@/functions/get-user";
import { orpc } from "@/utils/orpc";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import {
  BarChart3,
  Building2,
  Calendar,
  GraduationCap,
  Settings,
  Users,
} from "lucide-react";

export const Route = createFileRoute("/dean/")({
  component: DeanDashboard,
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

function DeanDashboard() {
  const { session } = Route.useRouteContext();

  const { data: departments } = useQuery(
    orpc.departments.getAll.queryOptions()
  );
  const { data: users } = useQuery({
    ...orpc.users.getAll.queryOptions(),
  });

  const facultyDepartments =
    departments?.filter((d) => d.facultyId === session?.user.facultyId) || [];
  const facultyUsers =
    users?.filter((u) => u.facultyId === session?.user.facultyId) || [];

  const quickActions = [
    { title: "Faculty Users", icon: Users, href: "/admin/users" },
    { title: "Departments", icon: Building2, href: "/admin/departments" },
    { title: "Courses", icon: GraduationCap, href: "/admin/courses" },
    { title: "Faculty Reports", icon: BarChart3, href: "/admin/reports" },
    { title: "Academic Sessions", icon: Calendar, href: "/admin/sessions" },
    { title: "Settings", icon: Settings, href: "/admin/settings" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dean Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {session?.user.name}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {facultyDepartments.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faculty Staff</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{facultyUsers.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Programs</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {quickActions.map((action) => (
          <Card
            key={action.title}
            className="hover:shadow-md transition-shadow"
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <action.icon className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="font-semibold">{action.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    Manage faculty {action.title.toLowerCase()}
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
    </div>
  );
}
