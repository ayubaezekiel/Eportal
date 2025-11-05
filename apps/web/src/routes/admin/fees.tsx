import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PaymentsTable } from "@/components/tables";
import { Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { PaymentForm } from "@/components/forms/payment";

export const Route = createFileRoute("/admin/fees")({
  component: FeesPage,
});

function FeesPage() {
  const { data: payments } = useQuery(orpc.payments.getAll.queryOptions());
  const { data: feeStructures } = useQuery(
    orpc.feeStructures.getAll.queryOptions()
  );

  const totalPayments = payments?.length || 0;
  const confirmedPayments =
    payments?.filter((p) => p.status === "Confirmed")?.length || 0;
  const pendingPayments =
    payments?.filter((p) => p.status === "Pending")?.length || 0;
  const confirmedAmount =
    payments
      ?.filter((p) => p.status === "Confirmed")
      .reduce((sum, p) => sum + Number(p.amount), 0) || 0;
  const totalFeeStructures = feeStructures?.length || 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Fee Management</h1>
          <p className="text-muted-foreground">
            Manage payments and fee structures
          </p>
        </div>
        <Dialog>
          <DialogTrigger>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Payment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <PaymentForm mode="create" />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPayments}</div>
            <p className="text-sm text-muted-foreground">
              {confirmedPayments} confirmed
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Pending Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingPayments}</div>
            <p className="text-sm text-muted-foreground">
              Awaiting confirmation
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₦{confirmedAmount.toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground">Confirmed payments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Fee Structures</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFeeStructures}</div>
            <p className="text-sm text-muted-foreground">Active structures</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <PaymentsTable />
        </CardContent>
      </Card>
    </div>
  );
}
