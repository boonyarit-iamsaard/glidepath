import { createFileRoute } from "@tanstack/react-router";

import { SignInFormContainer } from "@/features/auth";

export const Route = createFileRoute("/_auth/login")({
  component: RouteComponent,
});

function RouteComponent() {
  return <SignInFormContainer />;
}
