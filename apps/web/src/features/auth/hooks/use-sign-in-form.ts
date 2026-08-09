import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { AUTH_ROUTES } from "../auth-config";
import { authContent } from "../auth-content";
import { authClient } from "../lib/auth-client";
import { signInSchema } from "../lib/auth-schemas";

/**
 * Owns the sign-in form: state, validation, the request, and the result
 * messages. The form component only renders what this hook returns.
 */
export function useSignInForm() {
  const navigate = useNavigate();
  const { isPending } = authClient.useSession();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onSubmit: signInSchema,
    },
    onSubmit: async ({ value }) => {
      await authClient.signIn.email(value, {
        onSuccess: () => {
          navigate({ to: AUTH_ROUTES.afterSignIn });
          toast.success(authContent.signIn.toast.success);
        },
        onError: (error) => {
          toast.error(error.error.message || error.error.statusText);
        },
      });
    },
  });

  return {
    form,
    isSessionPending: isPending,
  };
}

export type SignInFormApi = ReturnType<typeof useSignInForm>["form"];
