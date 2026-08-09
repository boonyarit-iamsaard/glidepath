import { redirect } from "@tanstack/react-router";

import { AUTH_ROUTES } from "../auth-config";
import { authClient } from "./auth-client";

/**
 * Route guard for the auth pages. A signed-in person goes to the app instead.
 */
export async function redirectIfSignedIn() {
  const session = await authClient.getSession();

  if (session.data) {
    throw redirect({ to: AUTH_ROUTES.afterSignIn });
  }
}

/**
 * Route guard for the protected pages. Returns the session for the route
 * context, or sends the person to the sign-in page.
 */
export async function requireSession() {
  const session = await authClient.getSession();

  if (!session.data) {
    throw redirect({ to: AUTH_ROUTES.signIn });
  }

  return { session: session.data };
}
