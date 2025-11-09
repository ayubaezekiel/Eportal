import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUser } from "@/functions/get-user";
import { orpc } from "@/utils/orpc";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import {
  AlertCircle,
  BarChart3,
  BookOpen,
  Building,
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Download,
  FileText,
  GraduationCap,
  Settings,
  UserPlus,
  Users,
} from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
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

function AdminDashboard() {
  const { session } = Route.useRouteContext();

  // Fetch real data with permission checks
  const { data: users } = useQuery({
    ...orpc.users.getAll.queryOptions(),
  });

  const { data: payments } = useQuery(orpc.payments.getAll.queryOptions());
  const { data: academicSessions } = useQuery(
    orpc.academicSessions.getAll.queryOptions()
  );
  const { data: courseRegistrations } = useQuery(
    orpc.courseRegistrations.getAll.queryOptions()
  );
  const { data: results } = useQuery(orpc.results.getAll.queryOptions());
  const { data: petitions } = useQuery(orpc.petitions.getAll.queryOptions());

  const totalStudents =
    users?.filter((u) => u.userType === "student").length || 0;
  const totalStaff =
    users?.filter((u) =>
      ["lecturer", "admin", "hod", "dean"].includes(u.userType)
    ).length || 0;
  const activeSessions =
    academicSessions?.filter((s) => s.isCurrent).length || 0;
  const totalRevenue =
    payments?.reduce((sum, p) => Number(sum) + (Number(p.amount) || 0), 0) || 0;

  const stats = [
    {
      title: "Total Students",
      value: totalStudents.toString(),
      icon: Users,
    },
    {
      title: "Total Staff",
      value: totalStaff.toString(),
      icon: GraduationCap,
    },
    {
      title: "Active Sessions",
      value: activeSessions.toString(),
      icon: Calendar,
    },
    {
      title: "Total Revenue",
      value: new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
      }).format(totalRevenue),
      icon: DollarSign,
    },
  ];

  const quickActions = [
    { title: "Manage Users", icon: Users, href: "/admin/users" },
    { title: "Academic Sessions", icon: Calendar, href: "/admin/sessions" },
    { title: "Fee Management", icon: DollarSign, href: "/admin/fees" },
    { title: "Courses", icon: BookOpen, href: "/admin/courses" },
    { title: "Reports", icon: BarChart3, href: "/admin/reports" },
    { title: "System Settings", icon: Settings, href: "/admin/settings" },
    { title: "Faculties", icon: Building, href: "/admin/faculties" },
    { title: "Departments", icon: Building2, href: "/admin/departments" },
  ];

  // Generate recent activities from real data
  const getRecentActivities = () => {
    const activities: Array<{
      type: string;
      message: string;
      timestamp: Date;
      icon: typeof UserPlus;
      color: string;
    }> = [];

    // Recent user registrations
    const recentUsers = users
      ?.filter((u) => u.userType === "student")
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 3);

    recentUsers?.forEach((user) => {
      activities.push({
        type: "registration",
        message: `New student registration: ${user.firstName} ${user.lastName}`,
        timestamp: new Date(user.createdAt),
        icon: UserPlus,
        color: "bg-blue-500",
      });
    });

    // Recent payments
    const recentPayments = payments
      ?.filter((p) => p.status === "Confirmed")
      .sort(
        (a, b) =>
          new Date(`${b.paymentDate}`).getTime() -
          new Date(`${a.paymentDate}`).getTime()
      )
      .slice(0, 3);

    recentPayments?.forEach((payment) => {
      activities.push({
        type: "payment",
        message: `Payment confirmed: ${new Intl.NumberFormat("en-NG", {
          style: "currency",
          currency: "NGN",
        }).format(Number(payment.amount))}`,
        timestamp: new Date(`${payment.paymentDate}`),
        icon: CheckCircle,
        color: "bg-green-500",
      });
    });

    // Pending course registrations
    const pendingRegistrations = courseRegistrations
      ?.filter((r) => r.course_registrations.status === "Pending")
      .sort(
        (a, b) =>
          new Date(`${b.course_registrations.registrationDate}`).getTime() -
          new Date(`${a.course_registrations.registrationDate}`).getTime()
      )
      .slice(0, 2);

    pendingRegistrations?.forEach((reg) => {
      activities.push({
        type: "registration",
        message: `Course registration pending approval`,
        timestamp: new Date(`${reg.course_registrations.registrationDate}`),
        icon: Clock,
        color: "bg-yellow-500",
      });
    });

    // Recent result uploads
    const recentResults = results
      ?.filter((r) => r.results.status === "Published")
      .sort(
        (a, b) =>
          new Date(b.results.uploadedAt || b.results.createdAt).getTime() -
          new Date(a.results.uploadedAt || a.results.createdAt).getTime()
      )
      .slice(0, 2);

    recentResults?.forEach((result) => {
      activities.push({
        type: "result",
        message: `Results published for a course`,
        timestamp: new Date(
          result.results.uploadedAt || result.results.createdAt
        ),
        icon: FileText,
        color: "bg-purple-500",
      });
    });

    // Pending petitions
    const pendingPetitions = petitions
      ?.filter((p) => p.status === "Pending")
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 2);

    pendingPetitions?.forEach((petition) => {
      activities.push({
        type: "petition",
        message: `New petition: ${petition.subject}`,
        timestamp: new Date(petition.createdAt),
        icon: AlertCircle,
        color: "bg-red-500",
      });
    });

    // Sort all activities by timestamp and return top 5
    return activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 5);
  };

  const recentActivities = getRecentActivities();

  // Generate comprehensive report
  const handleGenerateReport = () => {
    const reportData = {
      generatedAt: new Date().toISOString(),
      generatedBy: `${session?.user.firstName} ${session?.user.lastName}`,
      statistics: {
        students: {
          total: totalStudents,
          active:
            users?.filter(
              (u) => u.userType === "student" && u.status === "active"
            ).length || 0,
          suspended:
            users?.filter(
              (u) => u.userType === "student" && u.status === "suspended"
            ).length || 0,
        },
        staff: {
          total: totalStaff,
          lecturers:
            users?.filter((u) => u.userType === "lecturer").length || 0,
          admins: users?.filter((u) => u.userType === "admin").length || 0,
        },
        financial: {
          totalRevenue: totalRevenue,
          confirmedPayments:
            payments?.filter((p) => p.status === "Confirmed").length || 0,
          pendingPayments:
            payments?.filter((p) => p.status === "Pending").length || 0,
        },
        academic: {
          activeSessions: activeSessions,
          courseRegistrations: courseRegistrations?.length || 0,
          pendingRegistrations:
            courseRegistrations?.filter(
              (r) => r.course_registrations.status === "Pending"
            ).length || 0,
          publishedResults:
            results?.filter((r) => r.results.status === "Published").length ||
            0,
        },
        support: {
          totalPetitions: petitions?.length || 0,
          pendingPetitions:
            petitions?.filter((p) => p.status === "Pending").length || 0,
          resolvedPetitions:
            petitions?.filter((p) => p.status === "Resolved").length || 0,
        },
      },
    };

    // Convert to JSON and trigger download
    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `admin-report-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {session?.user.firstName} {session?.user.lastName}
          </p>
        </div>
        <Button onClick={handleGenerateReport}>
          <Download className="mr-2 h-4 w-4" />
          Generate Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
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

        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivities.length > 0 ? (
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div
                      className={`w-2 h-2 ${activity.color} rounded-full`}
                    ></div>
                    <activity.icon className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm">{activity.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(activity.timestamp, {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No recent activities</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
