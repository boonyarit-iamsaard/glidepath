import { createFileRoute, Outlet } from "@tanstack/react-router";

import { Header } from "@/components/header";

export const Route = createFileRoute("/_public")({
  component: PublicLayout,
});

function PublicLayout() {
  return (
    <div className="grid min-h-svh grid-rows-[auto_1fr]">
      <Header />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
