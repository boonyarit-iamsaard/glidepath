# 09 — Derive the web environment types from the schema

**What to build:** Each web environment variable is declared exactly once.
Adding one means editing the schema and nothing else. Today the server URL is
declared twice — once in the schema and once by hand as an ambient type — so
the two can drift apart silently.

**Blocked by:** 02 — the web build guard, which exports the schema. 07 — the
composition root, which retires the escape hatch.

Status: ready-for-agent

- [ ] The ambient type for the web environment is derived from the schema.
- [ ] The hand-written declaration is deleted.
- [ ] The escape hatch that skips validation is removed from the web module and
      kept on the server module only.
- [ ] Adding a variable to the schema makes it appear on the ambient type with
      no second edit.
- [ ] `pnpm run types:check` passes.
- [ ] `pnpm run ci` passes.

## Notes

The escape hatch has never worked in the browser. Verified by inspecting a built
bundle: the build tool compiles the environment lookup down to an empty object,
so the flag is always undefined and validation is never skipped. Removing it
takes away nothing that worked.

Ticket 07 must land first. Until the composition root exists, the flag is
genuinely load-bearing for the container build.
