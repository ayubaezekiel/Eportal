import { ResultForm } from "@/components/forms";
import { ResultsTable } from "@/components/tables";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { getUser } from "@/functions/get-user";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/lecturer/results")({
  component: LecturerResultsPage,
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

function LecturerResultsPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Student Results</h1>
          <p className="text-muted-foreground">
            Enter and manage student results
          </p>
        </div>
        <PermissionGuard permission="result:create">
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Result
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Enter New Student Result</DialogTitle>
                <DialogDescription>
                  Fill out the form below to record a new result for a student.
                </DialogDescription>
              </DialogHeader>
              <ResultForm mode="create" />
            </DialogContent>
          </Dialog>
        </PermissionGuard>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Course Results</CardTitle>
        </CardHeader>
        <CardContent>
          <ResultsTable />
        </CardContent>
      </Card>
    </div>
  );
}
