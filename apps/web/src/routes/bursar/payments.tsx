import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUser } from "@/functions/get-user";
import { orpc } from "@/utils/orpc";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/bursar/payments")({
  component: BursarPayments,
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

function BursarPayments() {
  const { data: payments = [] } = useQuery(orpc.payments.getAll.queryOptions());

  const pendingPayments = payments.filter((p: any) => p.status === "Pending");

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Payment Management</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Pending Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">
              {pendingPayments.length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payments Awaiting Confirmation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pendingPayments.map((payment: any) => (
              <div
                key={payment.id}
                className="flex justify-between items-center p-4 border rounded-lg"
              >
                <div>
                  <h4 className="font-medium">
                    ₦{parseFloat(payment.amount).toLocaleString()}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Ref: {payment.referenceNumber}
                  </p>
                </div>
                <Button size="sm">Confirm</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
