import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { getUser } from "@/functions/get-user";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Users, GraduationCap, Calendar } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/registrar/")({
  component: RegistrarDashboard,
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

function RegistrarDashboard() {
  const { session } = Route.useRouteContext();
  const canViewUsers = ("view", "users");

  const { data: users = [] } = useQuery({
    ...orpc.users.getAll.queryOptions(),
  });

  const students = users.filter((u: any) => u.userType === "student");

  const quickActions = [
    { title: "Student Records", icon: Users, href: "/registrar/students" },
    { title: "Transcripts", icon: FileText, href: "/registrar/transcripts" },
    { title: "Academic Sessions", icon: Calendar, href: "/registrar/sessions" },
    { title: "Graduations", icon: GraduationCap, href: "/registrar/graduations" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Registrar Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {session?.user.name}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {quickActions.map((action) => (
          <Card key={action.title}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <action.icon className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="font-semibold">{action.title}</h3>
                </div>
              </div>
              <Link to={action.href} className="mt-4 block">
                <Button variant="outline" className="w-full">Access</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
