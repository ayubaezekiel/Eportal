import { createFileRoute, redirect } from "@tanstack/react-router";
import { getUser } from "@/functions/get-user";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AnnouncementsTable } from "@/components/tables";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { AnnouncementForm } from "@/components/forms";
import { PermissionGuard } from "@/components/auth/permission-guard";

export const Route = createFileRoute("/admin/announcements")({
  component: AdminAnnouncementsPage,
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

function AdminAnnouncementsPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Announcement Management</h1>
          <p className="text-muted-foreground">
            Create and manage system-wide announcements
          </p>
        </div>
        <PermissionGuard permission="announcement:create">
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Announcement
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <AnnouncementForm mode="create" />
            </DialogContent>
          </Dialog>
        </PermissionGuard>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Announcements</CardTitle>
        </CardHeader>
        <CardContent>
          <AnnouncementsTable />
        </CardContent>
      </Card>
    </div>
  );
}
