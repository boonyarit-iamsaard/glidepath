import { authClient } from "../lib/auth-client";

/**
 * Reads the current session. Components use the flat shape and never touch
 * the auth client.
 */
export function useSession() {
  const { data, isPending } = authClient.useSession();

  return {
    user: data?.user ?? null,
    isPending,
    isSignedIn: Boolean(data),
  };
}

export type SessionUser = NonNullable<ReturnType<typeof useSession>["user"]>;
