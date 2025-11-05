import { AcademicSessionForm } from "@/components/forms/academic-session";
import { AcademicSessionsTable } from "@/components/tables";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { View } from "@/components/view";
import { orpc } from "@/utils/orpc";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/admin/sessions")({
  component: SessionsPage,
});

function SessionsPage() {
  const { data: sessions, isPending } = useQuery(
    orpc.academicSessions.getAll.queryOptions()
  );

  const { data: courseRegistrations } = useQuery(
    orpc.courseRegistrations.getAll.queryOptions()
  );

  const totalSessions = sessions?.length || 0;
  const currentSession = sessions?.find((s) => s.isCurrent);
  const activeSessions = sessions?.filter((s) => s.isActive)?.length || 0;
  const totalRegistrations = courseRegistrations?.length || 0;

  return (
    <View isLoading={isPending} className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Academic Sessions</h1>
          <p className="text-muted-foreground">
            Manage academic sessions and calendars
          </p>
        </div>
        <Dialog>
          <DialogTrigger>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Session
            </Button>
          </DialogTrigger>
          <DialogContent>
            <AcademicSessionForm mode="create" />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Current Session</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentSession?.sessionName || "None"}
            </div>
            <p className="text-sm text-muted-foreground">
              {currentSession ? "Active session" : "No current session"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSessions}</div>
            <p className="text-sm text-muted-foreground">
              {activeSessions} active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Course Registrations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalRegistrations.toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground">Total registrations</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Academic Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <AcademicSessionsTable />
        </CardContent>
      </Card>
    </View>
  );
}
