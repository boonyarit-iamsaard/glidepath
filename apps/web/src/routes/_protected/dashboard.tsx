import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/dashboard")({
  component: RouteComponent,
});

function RouteComponent() {
  const { session } = Route.useRouteContext();

  return (
    <div className="grid gap-4">
      <h1 className="font-heading font-semibold text-2xl">Dashboard</h1>
      <p className="text-muted-foreground">Welcome {session?.user.name}</p>
    </div>
  );
}
