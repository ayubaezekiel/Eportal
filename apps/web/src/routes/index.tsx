import { LoginForm } from "@/components/sign-in-form";
import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  Bell,
  BookOpen,
  Building2,
  Calendar,
  CreditCard,
  FileText,
  GraduationCap,
  TrendingUp,
  Users,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  const isAuthenticated = false;

  if (!isAuthenticated) {
    return <UnauthenticatedHome />;
  }

  return <AuthenticatedHome />;
}

function UnauthenticatedHome() {
  return (
    <section className="container mx-auto max-w-7xl px-4">
      <LoginForm />
    </section>
  );
}

function AuthenticatedHome() {
  const quickActions = [
    {
      title: "Course Registration",
      description: "Register for courses this semester",
      icon: BookOpen,
      href: "/courses/register",
      color: "text-primary",
    },
    {
      title: "View Results",
      description: "Check your academic results",
      icon: TrendingUp,
      href: "/results",
      color: "text-secondary",
    },
    {
      title: "Make Payment",
      description: "Pay tuition and other fees",
      icon: CreditCard,
      href: "/payments",
      color: "text-accent",
    },
    {
      title: "View Timetable",
      description: "Check your class schedule",
      icon: Calendar,
      href: "/timetable",
      color: "text-primary",
    },
  ];

  const stats = [
    { label: "Current CGPA", value: "4.25", icon: TrendingUp },
    { label: "Credits Earned", value: "84", icon: BookOpen },
    { label: "Current Level", value: "300", icon: GraduationCap },
    { label: "Active Courses", value: "8", icon: FileText },
  ];

  const announcements = [
    {
      title: "Second Semester Registration Ongoing",
      date: "Oct 25, 2025",
      priority: "high",
    },
    {
      title: "Mid-Semester Break Announcement",
      date: "Oct 20, 2025",
      priority: "normal",
    },
    {
      title: "Library Extended Hours During Exams",
      date: "Oct 18, 2025",
      priority: "normal",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <section className="border-b bg-card">
        <div className="container mx-auto max-w-7xl px-4 py-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">
                Welcome Back, John Doe
              </h1>
              <p className="mt-2 text-lg text-muted-foreground">
                Computer Science • 300 Level • 2023/2024 Session
              </p>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Student ID</p>
                <p className="font-mono font-semibold">CSC/2021/001</p>
              </div>
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <GraduationCap className="h-8 w-8 text-primary" />
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="rounded-lg border bg-background p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <stat.icon className="h-8 w-8 text-muted-foreground/50" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content - 2 columns */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {quickActions.map((action, index) => (
                  <a
                    key={index}
                    href={action.href}
                    className="group rounded-lg border bg-card p-6 hover:shadow-lg transition-all hover:border-primary/50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <action.icon className={`h-5 w-5 ${action.color}`} />
                          <h3 className="font-semibold">{action.title}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {action.description}
                        </p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  </a>
                ))}
              </div>
            </section>

            {/* Recent Activity */}
            <section className="rounded-lg border bg-card p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Events
              </h2>
              <div className="space-y-3">
                {[
                  {
                    title: "CSC 301 Practical",
                    date: "Tomorrow, 10:00 AM",
                    venue: "Lab 3",
                  },
                  {
                    title: "AGR 305 Mid-Semester Test",
                    date: "Nov 2, 2025",
                    venue: "LT 2",
                  },
                  {
                    title: "Course Registration Deadline",
                    date: "Nov 5, 2025",
                    venue: "Online",
                  },
                ].map((event, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-md hover:bg-muted/50 transition-colors"
                  >
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{event.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {event.date} • {event.venue}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* API Status */}
            <section className="rounded-lg border bg-card p-4">
              <h2 className="mb-2 font-medium">System Status</h2>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-muted-foreground text-sm">
                  All systems operational
                </span>
              </div>
            </section>
          </div>

          {/* Sidebar - 1 column */}
          <div className="space-y-6">
            {/* Announcements */}
            <section className="rounded-lg border bg-card p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Announcements
              </h2>
              <div className="space-y-4">
                {announcements.map((announcement, index) => (
                  <div
                    key={index}
                    className="pb-4 border-b last:border-b-0 last:pb-0"
                  >
                    <div className="flex items-start gap-2 mb-1">
                      {announcement.priority === "high" && (
                        <div className="h-2 w-2 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm leading-tight">
                          {announcement.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          {announcement.date}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                <button className="w-full text-sm text-primary hover:underline mt-2">
                  View all announcements →
                </button>
              </div>
            </section>

            {/* Quick Links */}
            <section className="rounded-lg border bg-card p-6">
              <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
              <div className="space-y-2">
                {[
                  { label: "Student Portal", icon: Users },
                  { label: "Library Resources", icon: BookOpen },
                  { label: "Hostel Management", icon: Building2 },
                  { label: "Academic Calendar", icon: Calendar },
                  { label: "Download Forms", icon: FileText },
                ].map((link, index) => (
                  <a
                    key={index}
                    href="#"
                    className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors text-sm"
                  >
                    <link.icon className="h-4 w-4 text-muted-foreground" />
                    <span>{link.label}</span>
                  </a>
                ))}
              </div>
            </section>

            {/* Financial Summary */}
            <section className="rounded-lg border bg-card p-6">
              <h2 className="text-xl font-semibold mb-4">Financial Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Total Fees
                  </span>
                  <span className="font-semibold">₦250,000</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Amount Paid
                  </span>
                  <span className="font-semibold text-green-600">₦250,000</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t">
                  <span className="text-sm font-medium">Balance</span>
                  <span className="font-bold text-lg">₦0.00</span>
                </div>
                <div className="pt-2">
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 w-full" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Payment Complete ✓
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
