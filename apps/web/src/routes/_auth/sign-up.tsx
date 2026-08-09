import { createFileRoute } from "@tanstack/react-router";

import { SignUpFormContainer } from "@/features/auth";

export const Route = createFileRoute("/_auth/sign-up")({
  component: RouteComponent,
});

function RouteComponent() {
  return <SignUpFormContainer />;
}
