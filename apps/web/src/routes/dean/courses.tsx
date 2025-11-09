import { createFileRoute, redirect } from "@tanstack/react-router";
import { getUser } from "@/functions/get-user";
import { PermissionGuard, usePermission } from "@/components/auth/permission-guard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Plus, Eye } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";

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
  const canViewCourses = usePermission("view", "courses");
  const canCreateCourses = usePermission("create", "courses");

  const { data: courses = [] } = useQuery({
    ...orpc.courses.getAll.queryOptions(),
    enabled: canViewCourses,
  });

  if (!canViewCourses) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold">Access Denied</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                You don't have permission to view courses.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Faculty Courses</h1>
          <p className="text-muted-foreground">Manage courses across all departments</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Eye className="mr-2 h-4 w-4" />
            View All
          </Button>
          <PermissionGuard action="create" resource="courses">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Course
            </Button>
          </PermissionGuard>
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
