import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { getSession } from "@/lib/session";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: () => {
    const session = getSession();
    if (!session) throw redirect({ to: "/auth" });
    return { user: session };
  },
  component: () => <Outlet />,
});