import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ResultsTable } from "@/components/tables";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ResultForm } from "@/components/forms";

export const Route = createFileRoute("/lecturer/results")({
  component: LecturerResultsPage,
});

function LecturerResultsPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Student Results</h1>
          <p className="text-muted-foreground">Enter and manage student results</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Result
            </Button>
          </DialogTrigger>
          <DialogContent>
            <ResultForm mode="create" />
          </DialogContent>
        </Dialog>
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
