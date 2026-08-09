import { useNavigate } from "@tanstack/react-router";
import { useCallback } from "react";

import { AUTH_ROUTES } from "../auth-config";
import { authClient } from "../lib/auth-client";

/**
 * Signs the person out and sends them back to the public home page.
 */
export function useSignOut() {
  const navigate = useNavigate();

  return useCallback(async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          navigate({ to: AUTH_ROUTES.afterSignOut });
        },
      },
    });
  }, [navigate]);
}
