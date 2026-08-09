import { Field, FieldError, FieldLabel } from "@glidepath/ui/components/field";
import { Input } from "@glidepath/ui/components/input";
import type { AnyFieldApi } from "@tanstack/react-form";
import type { ComponentProps } from "react";

interface AuthFieldProps {
  field: AnyFieldApi;
  label: string;
  type?: ComponentProps<typeof Input>["type"];
  placeholder?: string;
}

/**
 * One labelled text input with its error message. It renders the field state
 * it gets and holds no state of its own.
 */
export function AuthField({
  field,
  label,
  type = "text",
  placeholder,
}: AuthFieldProps) {
  return (
    <Field data-invalid={field.state.meta.errors.length > 0}>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      <Input
        id={field.name}
        name={field.name}
        type={type}
        placeholder={placeholder}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(event) => field.handleChange(event.target.value)}
      />
      <FieldError errors={field.state.meta.errors} />
    </Field>
  );
}
