import { getUser } from "@/functions/get-user";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  CreditCard,
  FileText,
  Calendar,
  GraduationCap,
  Bell,
} from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/student/")({
  component: StudentDashboard,
  beforeLoad: async () => {
    const session = await getUser();
    return { session };
  },
  loader: async ({ context }) => {
    if (!context.session || context.session.user.userType !== "student") {
      throw redirect({ to: "/login" });
    }
  },
});

function StudentDashboard() {
  const { session } = Route.useRouteContext();

  const quickActions = [
    { title: "Course Registration", icon: BookOpen, href: "/student/courses" },
    { title: "Check Results", icon: GraduationCap, href: "/student/results" },
    { title: "Make Payment", icon: CreditCard, href: "/student/payments" },
    { title: "View Transcript", icon: FileText, href: "/student/transcript" },
    { title: "Academic Calendar", icon: Calendar, href: "/student/calendar" },
    { title: "Hostel Application", icon: Bell, href: "/student/hostel" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Student Portal</h1>
          <p className="text-muted-foreground">
            Welcome back, {session?.user.name}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Current Level</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {session?.user.currentLevel}L
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Current CGPA</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{session?.user.cgpa}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Credits Earned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {session?.user.totalCreditsEarned}
            </div>
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
                  key={action.title}
                  variant="outline"
                  className="h-20 flex-col"
                  asChild
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

        <Card>
          <CardHeader>
            <CardTitle>Recent Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm">Course registration is now open</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm">Payment confirmed</p>
                  <p className="text-xs text-muted-foreground">1 day ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm">Exam timetable released</p>
                  <p className="text-xs text-muted-foreground">3 days ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Semester Courses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-3 border rounded">
              <div>
                <p className="font-medium">CSC 401 - Software Engineering</p>
                <p className="text-sm text-muted-foreground">3 Credit Units</p>
              </div>
              <Button size="sm" variant="outline">
                View
              </Button>
            </div>
            <div className="flex justify-between items-center p-3 border rounded">
              <div>
                <p className="font-medium">CSC 403 - Database Systems</p>
                <p className="text-sm text-muted-foreground">3 Credit Units</p>
              </div>
              <Button size="sm" variant="outline">
                View
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
