import { SignInForm } from "../components/sign-in-form";
import { useSignInForm } from "../hooks/use-sign-in-form";

/**
 * Joins the sign-in logic to the sign-in view. Routes render this.
 */
export function SignInFormContainer() {
  const { form, isSessionPending } = useSignInForm();

  return <SignInForm form={form} isLoading={isSessionPending} />;
}
