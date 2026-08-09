import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@glidepath/ui/components/card";
import { FieldGroup } from "@glidepath/ui/components/field";
import type { ReactNode } from "react";

interface AuthFormCardProps {
  title: string;
  description: string;
  onSubmit: () => void;
  children: ReactNode;
}

/**
 * The shell both auth forms share: a card, a heading, and a form element that
 * calls back on submit.
 */
export function AuthFormCard({
  title,
  description,
  onSubmit,
  children,
}: AuthFormCardProps) {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onSubmit();
            }}
          >
            <FieldGroup>{children}</FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
