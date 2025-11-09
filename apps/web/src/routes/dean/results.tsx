import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUser } from "@/functions/get-user";
import { orpc } from "@/utils/orpc";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { CheckCircle, Eye } from "lucide-react";

export const Route = createFileRoute("/dean/results")({
  component: DeanResults,
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

function DeanResults() {
  const { data: results = [] } = useQuery(orpc.results.getAll.queryOptions());

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Faculty Results</h1>
          <p className="text-muted-foreground">
            Monitor and oversee faculty results
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Eye className="mr-2 h-4 w-4" />
            View All Results
          </Button>
          <Button>
            <CheckCircle className="mr-2 h-4 w-4" />
            Approve Results
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Faculty Results Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Results from all departments in your faculty will appear here.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Results Requiring Approval</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Results pending your approval as Dean.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
