# Handoff — architecture review of the project plumbing

Date: 2026-08-18

## Where the work stands

An architecture review of the project plumbing is finished and presented. The
maintainer has not yet chosen a candidate to explore. Nothing in the repository
was changed during the session — the review is read-only so far.

The next step is to get that choice, then run the grilling loop on the chosen
candidate.

## Scope of the review

The maintainer first asked for a review of the whole codebase, then redirected
to **project plumbing only**. Plumbing means the workspace wiring, not the
feature code:

- `package.json`, `pnpm-workspace.yaml`, `turbo.json`, the tsconfig files
- `packages/env`, `packages/db`, `packages/auth`, `packages/config`
- `apps/server` and its `Dockerfile`, `docker-compose.yml`
- `.github/workflows/ci.yml`, `.github/dependabot.yml`

The auth feature module in `apps/web/src/features/auth/` was read before the
redirect. It is **out of scope**. Do not report on it unless asked.

## The report

The full report, with before and after diagrams for every candidate, sits next
to this file at `architecture-review-20260818-223236.html`. Open it in a
browser.

The report needs a network connection. It loads Tailwind and Mermaid from a CDN.
The findings below are the load-bearing parts, so the work survives without it.

## The six candidates

| #   | Candidate                                                | Strength        |
| --- | -------------------------------------------------------- | --------------- |
| 1   | Give the server a composition root                       | Strong          |
| 2   | Put every package behind one compiler-policy seam        | Strong          |
| 3   | Reconcile the task graph with the packages' build config | Worth exploring |
| 4   | One configuration seam for `DATABASE_URL`                | Worth exploring |
| 5   | Move the smoke test out of the workflow file             | Worth exploring |
| 6   | Split the env module by environment                      | Speculative     |

Recommended first: **candidate 1**. It is the root cause under candidates 4, 5
and 6, and the workspace has no test surface at all today.

## Verified findings

These were checked against the code, not inferred.

- **A second connection pool is built and never used.**
  `apps/server/src/index.ts:1` imports `auth`. That runs the module body of
  `packages/db/src/index.ts`, where line 10 executes `export const db =
createDb()`. Then `createAuth()` in `packages/auth/src/index.ts:8` calls
  `createDb()` a second time. The first instance is never queried.
- **Four packages have no `types:check` task.** `turbo run types:check --dry`
  reports `NONEXISTENT` for `@glidepath/env`, `@glidepath/db`,
  `@glidepath/auth` and `@glidepath/config`. Only `ui`, `server` and `web` run
  a check.
- **`packages/db` and `packages/auth` carry inert build config.** Both set
  `composite`, `declaration`, `declarationMap` and `outDir: dist`. No package
  has a `build` script, and no tsconfig in the workspace uses `references`, so
  `^build` in `turbo.json` resolves to nothing.
- **`apps/web/tsconfig.json` does not extend `@glidepath/config`.** The largest
  app is checked without `noUncheckedIndexedAccess`, `noUnusedLocals`,
  `noUnusedParameters`, `verbatimModuleSyntax`, `isolatedModules`,
  `noFallthroughCasesInSwitch` and `forceConsistentCasingInFileNames`. It also
  declares a `@glidepath/ui/*` path alias that competes with the package's own
  `exports` map.
- **`DATABASE_URL` is stated three ways.** A zod schema in
  `packages/env/src/server.ts:7`, a raw `process.env.DATABASE_URL || ""` in
  `packages/db/drizzle.config.ts:13` that loads `../../apps/server/.env` by
  relative path, and a literal in `docker-compose.yml:16`.
- **Local `ci` and GitHub `ci` differ.** The `ci` script in `package.json:32`
  stops after the build. The image build and the smoke test exist only in
  `.github/workflows/ci.yml:58-78`, so a maintainer cannot run them.
- **Unused declarations.** `@hookform/resolvers` and `dotenv` in `apps/web`;
  `dotenv` and `zod` in `packages/auth`; `zod` in `packages/db`; `jsx` and
  `jsxImportSource` in `apps/server/tsconfig.json`; a `workspaces` field in the
  root `package.json` that pnpm ignores.

## Domain documents

`CONTEXT.md` and `docs/adr/` do not exist yet. No candidate contradicts a
recorded decision, because none is recorded. Per `docs/agents/domain.md`, create
these lazily — only when a term or a decision is actually resolved.

## Conventions to follow

- Every `.md` file you touch must pass `pnpm format` and `pnpm lint:md` before
  you finish. See `AGENTS.md`.
- Write prose at CEFR B2-C1. Write steps and commands in Simplified Technical
  English.
- Use the vocabulary of the `codebase-design` skill exactly: module, interface,
  implementation, depth, deep, shallow, seam, adapter, leverage, locality. Do
  not write component, service, API or boundary.
- A commit scope names a domain, not a package. Write `refactor(auth)`, not
  `build(server)`. Omit the scope when no domain fits.
- Do not add a `Co-Authored-By` trailer to commits.

## Suggested skills

Call the Skill tool for these:

- `codebase-design` — required. It holds the vocabulary the review is written
  in, and the design-it-twice pattern for exploring alternative interfaces.
- `grilling` — the next step once the maintainer picks a candidate.
- `domain-modeling` — when a deepened module needs a name, or the maintainer
  rejects a candidate for a reason worth recording as an ADR.
- `typescript-house-style` — before writing any TypeScript.
- `tdd` — candidate 1 exists to create a test surface. There are no tests in
  the repository and no test runner is installed.
