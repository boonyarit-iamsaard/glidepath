import Loader from "@/components/loader";

import { AUTH_ROUTES } from "../auth-config";
import { authContent } from "../auth-content";
import type { SignUpFormApi } from "../hooks/use-sign-up-form";
import { AuthField } from "./auth-field";
import { AuthFormCard } from "./auth-form-card";
import { AuthFormFooter } from "./auth-form-footer";

const content = authContent.signUp;

interface SignUpFormProps {
  form: SignUpFormApi;
  isLoading: boolean;
}

/**
 * Renders the sign-up form. All state and all requests come from
 * `useSignUpForm`.
 */
export function SignUpForm({ form, isLoading }: SignUpFormProps) {
  if (isLoading) {
    return <Loader />;
  }

  return (
    <AuthFormCard
      title={content.title}
      description={content.description}
      onSubmit={() => form.handleSubmit()}
    >
      <form.Field name="name">
        {(field) => (
          <AuthField
            field={field}
            label={content.fields.name.label}
            placeholder={content.fields.name.placeholder}
          />
        )}
      </form.Field>

      <form.Field name="email">
        {(field) => (
          <AuthField
            field={field}
            label={content.fields.email.label}
            type="email"
            placeholder={content.fields.email.placeholder}
          />
        )}
      </form.Field>

      <form.Field name="password">
        {(field) => (
          <AuthField
            field={field}
            label={content.fields.password.label}
            type="password"
          />
        )}
      </form.Field>

      <form.Subscribe
        selector={(state) => ({
          canSubmit: state.canSubmit,
          isSubmitting: state.isSubmitting,
        })}
      >
        {({ canSubmit, isSubmitting }) => (
          <AuthFormFooter
            canSubmit={canSubmit}
            isSubmitting={isSubmitting}
            submitLabel={content.submit.idle}
            pendingLabel={content.submit.pending}
            prompt={content.footer.prompt}
            linkLabel={content.footer.link}
            linkTo={AUTH_ROUTES.signIn}
          />
        )}
      </form.Subscribe>
    </AuthFormCard>
  );
}
