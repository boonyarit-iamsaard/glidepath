import { SignUpForm } from "../components/sign-up-form";
import { useSignUpForm } from "../hooks/use-sign-up-form";

/**
 * Joins the sign-up logic to the sign-up view. Routes render this.
 */
export function SignUpFormContainer() {
  const { form, isSessionPending } = useSignUpForm();

  return <SignUpForm form={form} isLoading={isSessionPending} />;
}
