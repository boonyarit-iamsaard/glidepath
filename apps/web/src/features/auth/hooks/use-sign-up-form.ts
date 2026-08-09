import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { AUTH_ROUTES } from "../auth-config";
import { authContent } from "../auth-content";
import { authClient } from "../lib/auth-client";
import { signUpSchema } from "../lib/auth-schemas";

/**
 * Owns the sign-up form: state, validation, the request, and the result
 * messages. The form component only renders what this hook returns.
 */
export function useSignUpForm() {
  const navigate = useNavigate();
  const { isPending } = authClient.useSession();

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
    validators: {
      onSubmit: signUpSchema,
    },
    onSubmit: async ({ value }) => {
      await authClient.signUp.email(value, {
        onSuccess: () => {
          navigate({ to: AUTH_ROUTES.afterSignIn });
          toast.success(authContent.signUp.toast.success);
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

export type SignUpFormApi = ReturnType<typeof useSignUpForm>["form"];
