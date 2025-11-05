import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PaymentsTable } from "@/components/tables";
import { Plus, Download } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { PaymentForm } from "@/components/forms";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { useUser } from "@/hooks/auth";

export const Route = createFileRoute("/student/payments")({
  component: StudentPaymentsPage,
});

function StudentPaymentsPage() {
  const { data: user } = useUser();
  const { data: payments } = useQuery(orpc.payments.getAll.queryOptions());

  const exportPayments = () => {
    const studentPayments = payments?.filter(p => p.studentId === user?.data?.user?.id) || [];
    
    const csvContent = [
      ['Amount', 'Status', 'Type', 'Date'],
      ...studentPayments.map(p => [p.amount, p.status, p.paymentType, new Date(p.createdAt).toLocaleDateString()])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'payment-history.csv';
    a.click();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">My Payments</h1>
          <p className="text-muted-foreground">View your payment history and make new payments</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportPayments} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Make Payment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <PaymentForm mode="create" />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          <PaymentsTable />
        </CardContent>
      </Card>
    </div>
  );
}
