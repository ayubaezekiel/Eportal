import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUser } from "@/functions/get-user";
import { orpc } from "@/utils/orpc";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { Edit, Plus } from "lucide-react";

export const Route = createFileRoute("/bursar/fees")({
  component: BursarFees,
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

function BursarFees() {
  const { data: feeStructures = [] } = useQuery(
    orpc.feeStructures.getAll.queryOptions()
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Fee Structure Management</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Fee Structure
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fee Structures ({feeStructures.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {feeStructures.map((fee: any) => (
              <div
                key={fee.id}
                className="flex justify-between items-center p-4 border rounded-lg"
              >
                <div>
                  <h4 className="font-medium">
                    Level {fee.level} - {fee.studyMode}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Total: ₦{parseFloat(fee.totalAmount).toLocaleString()}
                  </p>
                </div>
                <Button size="sm" variant="outline">
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
