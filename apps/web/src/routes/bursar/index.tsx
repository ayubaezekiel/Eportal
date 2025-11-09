import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { getUser } from "@/functions/get-user";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePermission } from "@/components/auth/permission-guard";
import { DollarSign, CreditCard, TrendingUp, FileText } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/bursar/")({
  component: BursarDashboard,
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

function BursarDashboard() {
  const { session } = Route.useRouteContext();
  const canViewPayments = usePermission("view", "payments");

  const { data: payments = [] } = useQuery({
    ...orpc.payments.getAll.queryOptions(),
    enabled: canViewPayments,
  });

  const totalRevenue = payments.reduce(
    (sum: number, p: any) => sum + parseFloat(p.amount || "0"),
    0
  );

  const quickActions = [
    { title: "Payment Management", icon: CreditCard, href: "/bursar/payments" },
    { title: "Fee Structures", icon: DollarSign, href: "/bursar/fees" },
    { title: "Financial Reports", icon: TrendingUp, href: "/bursar/reports" },
    { title: "Revenue Analysis", icon: FileText, href: "/bursar/revenue" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Bursar Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {session?.user.name}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              ₦{totalRevenue.toLocaleString()}
            </div>
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
