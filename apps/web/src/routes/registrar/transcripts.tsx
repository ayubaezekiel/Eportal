import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUser } from "@/functions/get-user";
import { orpc } from "@/utils/orpc";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/registrar/transcripts")({
  component: RegistrarTranscripts,
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

function RegistrarTranscripts() {
  const { data: transcripts = [] } = useQuery(
    orpc.transcripts.getAll.queryOptions()
  );
  const pendingTranscripts = transcripts.filter(
    (t: any) => t.status === "Pending"
  );

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Transcript Management</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Pending Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">
              {pendingTranscripts.length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Transcript Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pendingTranscripts.map((transcript: any) => (
              <div
                key={transcript.id}
                className="flex justify-between items-center p-4 border rounded-lg"
              >
                <div>
                  <h4 className="font-medium">
                    Request #{transcript.transcriptNumber}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Student: {transcript.studentId}
                  </p>
                </div>
                <Button size="sm">Process</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
