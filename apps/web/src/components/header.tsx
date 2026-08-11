import { Link } from "@tanstack/react-router";

import { UserMenuContainer } from "@/features/auth";

import { ModeToggle } from "./mode-toggle";

const LINKS = [{ to: "/dashboard", label: "Dashboard" }] as const;

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-border border-b bg-background">
      <div className="mx-auto flex h-14 w-full max-w-2xl items-center gap-6 px-6">
        <Link
          to="/"
          className="font-heading font-semibold text-sm tracking-tight"
        >
          glidepath
        </Link>
        <nav className="flex items-center gap-4">
          {LINKS.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="text-muted-foreground text-sm transition-colors hover:text-foreground data-[status=active]:text-foreground"
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <ModeToggle />
          <UserMenuContainer />
        </div>
      </div>
    </header>
  );
}
