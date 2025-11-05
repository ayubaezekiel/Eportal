import { getUser } from "@/functions/get-user";
import { createFileRoute, redirect } from "@tanstack/react-router";

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
    }
  },
});

function RouteComponent() {
  return null; // This component should never render due to redirects
}
