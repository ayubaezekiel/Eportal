import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUser } from "@/functions/get-user";
import { orpc } from "@/utils/orpc";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { Edit, UserPlus } from "lucide-react";

export const Route = createFileRoute("/registrar/students")({
  component: RegistrarStudents,
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

function RegistrarStudents() {
  const { data: users = [] } = useQuery({
    ...orpc.users.getAll.queryOptions(),
  });

  const students = users.filter((u: any) => u.userType === "student");

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Student Records</h1>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Student
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Students ({students.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {students.map((student) => (
              <div
                key={student.id}
                className="flex justify-between items-center p-4 border rounded-lg"
              >
                <div>
                  <h4 className="font-medium">{student.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {student.matricNumber} | {student.email}
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
