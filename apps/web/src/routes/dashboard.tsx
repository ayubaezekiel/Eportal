import { createFileRoute, redirect } from "@tanstack/react-router";
import { getUser } from "@/functions/get-user";

export const Route = createFileRoute("/dashboard")({
  component: RouteComponent,
  beforeLoad: async () => {
    const session = await getUser();
    return { session };
  },
  loader: async ({ context }) => {
    if (!context.session) {
      throw redirect({ to: "/login" });
    }

    const userType = context.session.user.userType;

    if (userType === "admin") {
      throw redirect({ to: "/admin" });
    } else if (userType === "student") {
      throw redirect({ to: "/student" });
    } else if (userType === "lecturer") {
      throw redirect({ to: "/lecturer" });
    } else if (userType === "dean") {
      throw redirect({ to: "/dean" });
    } else if (userType === "hod") {
      throw redirect({ to: "/hod" });
    } else if (userType === "registrar") {
      throw redirect({ to: "/registrar" });
    } else if (userType === "bursar") {
      throw redirect({ to: "/bursar" });
    }
  },
});

function RouteComponent() {
  return null;
}
