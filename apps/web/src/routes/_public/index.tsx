import { Button } from "@glidepath/ui/components/button";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_public/")({
  component: HomeComponent,
});

const STACK = [
  {
    name: "Auth",
    detail: "Better Auth, email and password, sessions in Postgres",
  },
  { name: "Database", detail: "Drizzle ORM on PostgreSQL" },
  { name: "API", detail: "Hono on Node, served from apps/server" },
  { name: "Web", detail: "React and TanStack Router, built by Vite" },
  { name: "UI", detail: "shadcn/ui primitives shared from packages/ui" },
] as const;

function HomeComponent() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-16 px-6 py-20 sm:py-28">
      <section className="flex flex-col items-start gap-6">
        <h1 className="font-heading font-semibold text-4xl tracking-tight sm:text-5xl">
          glidepath
        </h1>
        <p className="max-w-prose text-lg text-muted-foreground leading-relaxed">
          A TypeScript monorepo with the plumbing already in place. The product
          is not decided yet, so this page says what runs, and nothing more.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="lg" render={<Link to="/sign-up" />}>
            Create an account
          </Button>
          <Button size="lg" variant="ghost" render={<Link to="/login" />}>
            Sign in
          </Button>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-medium text-muted-foreground text-sm">
          What is wired up
        </h2>
        <dl className="divide-y divide-border border-border border-y">
          {STACK.map(({ name, detail }) => (
            <div
              key={name}
              className="grid gap-1 py-3 sm:grid-cols-[8rem_1fr] sm:gap-4"
            >
              <dt className="font-medium text-sm">{name}</dt>
              <dd className="text-muted-foreground text-sm">{detail}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
