import { Button } from "@glidepath/ui/components/button";
import { Field, FieldDescription } from "@glidepath/ui/components/field";
import type { LinkProps } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";

interface AuthFormFooterProps {
  isSubmitting: boolean;
  canSubmit: boolean;
  submitLabel: string;
  pendingLabel: string;
  prompt: string;
  linkLabel: string;
  linkTo: LinkProps["to"];
}

/**
 * The submit button and the link to the other auth page.
 */
export function AuthFormFooter({
  isSubmitting,
  canSubmit,
  submitLabel,
  pendingLabel,
  prompt,
  linkLabel,
  linkTo,
}: AuthFormFooterProps) {
  return (
    <Field>
      <Button type="submit" disabled={!canSubmit || isSubmitting}>
        {isSubmitting ? pendingLabel : submitLabel}
      </Button>
      <FieldDescription className="text-center">
        {prompt} <Link to={linkTo}>{linkLabel}</Link>
      </FieldDescription>
    </Field>
  );
}
