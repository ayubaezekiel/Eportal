import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUser } from "@/functions/get-user";
import { orpc } from "@/utils/orpc";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { Eye, Plus } from "lucide-react";

export const Route = createFileRoute("/dean/courses")({
  component: DeanCourses,
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

function DeanCourses() {
  const { data: courses = [] } = useQuery({
    ...orpc.courses.getAll.queryOptions(),
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Faculty Courses</h1>
          <p className="text-muted-foreground">
            Manage courses across all departments
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Eye className="mr-2 h-4 w-4" />
            View All
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Course
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Faculty Courses ({courses.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            All courses offered in your faculty will appear here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
