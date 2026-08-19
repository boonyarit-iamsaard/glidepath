# Spec — make the project plumbing tell one story

Status: ready-for-agent

Date: 2026-08-19

Source: the architecture review in `.scratch/plumbing-review/`, then four rounds
of grilling with the maintainer.

## Problem Statement

glidepath is a personal finance headquarters — tracking, budgeting and
forecasting. No feature is built yet. The maintainer wants the plumbing correct
before the first one lands, because plumbing mistakes get copied by every
feature that follows.

The plumbing currently states things that are not true, and the workspace has no
way to notice.

- **The build passes while producing a broken artifact.** `apps/web` reads its
  configuration in the browser. If a variable is missing, the build still exits
  0 and the failure appears as a white page in a browser that no check ever
  opens. CI builds exactly this bundle today and calls it a pass.
- **Importing a module starts a database connection.** `@glidepath/db` and
  `@glidepath/auth` each build and export a live instance at module load, so
  neither can be loaded without live configuration. `@glidepath/auth` opens a
  second connection pool while the first one is never queried.
- **Four packages are never type-checked.** `turbo run types:check` reports
  `NONEXISTENT` for `@glidepath/env`, `@glidepath/db`, `@glidepath/auth` and
  `@glidepath/config`. The web environment module is only ever checked inside
  the web app's weaker program, which is how a permanently dead escape hatch
  survived in it.
- **The largest app opts out of the shared compiler policy.** `apps/web` does
  not extend `@glidepath/config`, so it is checked under weaker rules than every
  package it imports.
- **Packages carry build config for a build that does not exist.** No package
  has a build script and no tsconfig uses project references, so the `^build`
  dependency in the task graph resolves to nothing.
- **The only behavioural check cannot be run by a human.** The image build and
  smoke test live in workflow YAML. A maintainer cannot run them.
- **Nine declarations claim something the code does not do.** Unused
  dependencies and dead compiler options across five packages.
- **There is no test surface at all.** No test, no test runner.

## Solution

Give the workspace one place to state each fact, and one seam to test through.

The server gets a composition root. Configuration is read once, at the edge, and
passed down as narrow parameters. `createServer` returns the running-ready app
without starting it, so a test can drive the whole runtime in process. Packages
export factories only, never instances. The second connection pool disappears,
and the build-time escape hatch that only existed to survive module-load
validation is retired.

Every package is then checked under one compiler policy, by a task graph that
actually reaches it. The web build fails loudly when a variable is missing,
instead of shipping a bundle that fails in the browser. The image smoke test
becomes a module a maintainer can run with one command.

The work is split into five efforts that land in order. Each one leaves the
workspace in a working state.

## User Stories

1. As a maintainer, I want the web build to fail when a required variable is
   missing, so that a misconfigured deployment is caught before it reaches a
   browser.
2. As a maintainer, I want each variable declared exactly once, so that adding
   one does not mean remembering three places.
3. As a maintainer, I want to load a package in a test without a live database,
   so that I can write a test at all.
4. As a maintainer, I want one connection pool per running server, so that the
   database is not holding connections nothing uses.
5. As a maintainer, I want to see what the server does by reading one function,
   so that I do not have to trace import side effects to understand start-up.
6. As a maintainer, I want configuration passed in rather than read at import,
   so that a test can supply its own without touching the environment.
7. As a maintainer, I want the type checker to cover every package I wrote, so
   that a mistake in a small package is not found by the app that imports it.
8. As a maintainer, I want one file to set the compiler policy, so that
   tightening a rule tightens it everywhere.
9. As a maintainer, I want the largest app held to the same rules as the
   packages it imports, so that the weakest checked code is not the code I write
   most.
10. As a maintainer, I want the build config to describe a build that exists, so
    that the task graph and the packages agree.
11. As a maintainer, I want `turbo run types:check` to name a real command for
    every package with source, so that a green run means something was checked.
12. As a maintainer, I want to run the image smoke test on my laptop, so that I
    can reproduce a CI failure without pushing a commit.
13. As a maintainer, I want the throwaway boot values read from the documented
    example, so that the values the server needs are written down once.
14. As a maintainer, I want the migration tool to read configuration through the
    same module as everything else, so that a missing URL fails at the seam
    instead of deep inside the driver.
15. As a maintainer, I want a missing database URL to fail loudly, so that an
    empty string is never treated as a valid connection.
16. As a maintainer, I want the type checker to stop writing into the directory
    the bundler owns, so that two tasks cannot clobber each other's output.
17. As a maintainer, I want a test runner installed, so that the next change can
    be made test-first.
18. As a maintainer, I want a test that boots the server and exercises a route,
    so that a refactor of start-up cannot silently break it.
19. As a maintainer, I want a test that signs a user up against a real Postgres,
    so that the only behaviour the repository has today is covered.
20. As a maintainer, I want the smoke test to keep proving the runtime image
    carries every package the bundle imports, so that an in-process test does
    not create false confidence about the image.
21. As a maintainer, I want dependencies I do not import removed, so that the
    dependency list means what it says.
22. As a maintainer, I want compiler options that describe absent behaviour
    removed, so that a reader does not infer a build step that never runs.
23. As a maintainer, I want the project structure in the README to list every
    package, so that a newcomer finds the ones that hold configuration.
24. As a future reader, I want to know why packages export factories and not
    instances, so that I do not restore the pattern the upstream scaffold uses.
25. As a future reader, I want to know why no package has a build script, so
    that I do not read it as an oversight.
26. As a future reader, I want to know why the schema reaches the database
    without generated migrations, so that I know when that stops being safe.
27. As a maintainer, I want the escape hatch that skips validation to stop being
    load-bearing, so that the container build does not depend on switching
    validation off.
28. As an agent picking up this work, I want each effort written as its own
    ticket, so that I can land one without holding the others in mind.

## Implementation Decisions

### Seams

The workspace has no seam today. This spec adds one, and makes one existing
process-level check into a second. Two is the honest number, because they prove
different kinds of fact.

- **`createServer(config)` in `apps/server` — the seam.** It returns the app
  and does not listen. Everything the server does crosses it: cross-origin
  handling, request logging, the auth routes, the root route. Tests drive it in
  process through the returned app's `request` method. This is the highest seam
  available in the workspace, and it is the only new one.
- **The seam owns disposal.** `createServer` also returns a way to close what
  it opened. It opens a connection pool, so something must close it: the entry
  point on shutdown, a test in teardown. Without this a test cannot release the
  pool except by reaching behind the seam, which is exactly what the seam exists
  to prevent.
- **`pnpm run smoke` — a process-level seam.** It builds the image, starts the
  stack, and probes the running container. It proves the runtime stage of the
  image carries every package the bundle imports. No in-process seam can prove
  that, which is why it is kept rather than replaced.

`createDb` and `createAuth` are deliberately **not** seams. Each will have one
adapter and no second one is planned, so an interface at either point would
exist only to serve a test. They are factories reached through the seam above.

### Effort 0 — remove the untruths, and guard the web build

- Remove the dependencies no module imports: the form resolver package and
  `dotenv` from `apps/web`, `dotenv` from `packages/auth`, `zod` from
  `packages/db` and `packages/auth`, `@glidepath/db` from `apps/server`. The
  server reaches the database module through `@glidepath/auth`, which the
  bundler inlines.
- Remove the `workspaces` field from the root manifest. pnpm reads
  `pnpm-workspace.yaml` and ignores it.
- Add `packages/env` and `packages/config` to the project structure in the
  README.
- `packages/env` exports its web schema as a value in its own right, separate
  from the parsed result. The Vite config then validates with the same schema
  rather than declaring the variable a third time.
- The web app's Vite config loads the environment and validates it at build
  time, in Node, and throws on a missing or invalid value. The browser-side
  check stays as a second net.

### Effort 1 — one compiler policy, one task graph

- `apps/web` extends `@glidepath/config`. It keeps only what is genuinely its
  own: the JSX setting, the Vite client types, and its own path alias. The
  duplicate alias for the shared UI package is deleted, because the package's
  `exports` map already resolves it.
- The server drops the JSX options. It has no JSX.
- `packages/db`, `packages/auth` and `apps/server` drop `composite`,
  `declaration`, `declarationMap` and `outDir`. Packages are consumed as source
  and inlined by the bundler.
- The server's type check becomes a no-emit check. Today it emits JavaScript,
  declarations and a build-info file into the directory the bundler owns and
  the task graph caches as build output.
- `@glidepath/env`, `@glidepath/db` and `@glidepath/auth` each gain a no-emit
  type check. `@glidepath/config` holds no source and gains none.
- The web app's override must set the DOM libraries and keep the Vite client
  types rather than inheriting Node's. With those two settings the shared policy
  produces **zero** type errors and needs no source changes — measured, not
  estimated. Without them it produces 15, all of them symptoms: `window` and
  `document` go missing and `KeyboardEvent` resolves to Node's global instead of
  the DOM one. `packages/ui` already solves this exactly this way.
- The database package's type check cannot be added before its declaration emit
  is dropped. Doing so fails with two errors, because the inferred factory type
  cannot be named without referencing `Pool` from the Postgres types. Dropping
  the inert options clears both.

### Effort 2 — the composition root

- `packages/db` exports `createDb(databaseUrl)`. The module-level instance is
  deleted. The module no longer imports the environment module.
- `packages/auth` exports `createAuth(db, config)`, where `config` carries only
  the secret, the base URL and the trusted origin. The module-level instance is
  deleted. The module no longer imports the environment module.
- `apps/server` gains `createServer(config)`, which builds the app and returns
  it without listening. Its entry point reads the environment once, calls
  `createServer`, and starts the server.
- Configuration is threaded as **narrow parameters**, not as the whole parsed
  environment. A module's interface should state what it needs and nothing
  else.
- The container build stops setting the flag that skips validation. It only
  existed because importing a module ran validation.

### Effort 3 — the configuration seam and the smoke test

- The environment package exposes a **narrow** database configuration — the
  database URL alone. A migration must not fail because an unrelated auth
  variable is absent. The variable keeps **one** schema declaration, shared by
  the narrow configuration and the full server configuration. Declaring it twice
  inside the environment package would reproduce the very fault this effort
  removes.
- The migration tool's config reads the database URL through that narrow
  configuration. The empty-string fallback is deleted.
- The environment file is resolved from the config file's own location, not the
  working directory. The current relative path works only by accident: it
  happens to match the directory the task graph runs the command in. Verified —
  importing the server environment module from the database package's directory
  throws with every variable undefined, so a naive fix breaks every documented
  database command.
- Docker Compose derives the database URL from the same variables rather than
  restating it.
- The image build and smoke test move into one script. It seeds throwaway boot
  values from the documented example file, builds, starts, waits, probes,
  collects logs, and cleans up. It is exposed as `pnpm run smoke`.
- The script must be safe to run on a laptop. The workflow version overwrites
  and then deletes the server environment file, and tears the stack down with
  volumes removed. Run as-is locally, that destroys the maintainer's own
  configuration and the local database. The script therefore leaves an existing
  environment file untouched, runs under its own Compose project and volume, and
  never removes a volume belonging to the development stack.
- A separate Compose project name is not sufficient isolation. The Compose file
  pins both container names, names the volume and the network explicitly, and
  binds fixed host ports — all of them global. The smoke stack either overrides
  every one of those identifiers, or detects a running development stack and
  stops before changing anything.
- The workflow calls the script once. `pnpm run ci` does **not** call it,
  because Docker is not always running on a laptop.

### Effort 4 — the web environment module

- The ambient type declaration for the web environment is derived from the
  schema, so one edit changes both. The hand-written declaration is deleted.
- The escape hatch is removed from the web module and kept on the server
  module. In a browser bundle the hatch is compiled to `undefined` and has
  never had any effect.

### Decisions recorded as ADRs

Three decisions clear the bar — hard to reverse, surprising without context, and
the result of a real trade-off. They are written as ADRs under `docs/adr/`.

1. **The server is composed at one root.** Packages export factories, never
   instances. This departs from the upstream scaffold on purpose.
2. **Workspace packages are source-only.** No build script, no project
   references. The alternative — making the packages built modules — was
   considered and rejected, because it would add a build step to serve a
   consumer that does not exist.
3. **The schema reaches the database with a direct push, not generated
   migrations.** Recorded with its revisit condition: adopt generated migrations
   before the first deploy that holds transactions the maintainer would mind
   losing, which is the point at which the tracking MVP settles. No hosted
   database exists during this work, so the decision carries no data risk today.

Choosing the test runner, extending the shared compiler policy and moving the
smoke test into a script are **not** ADR-worthy. All three are easy to reverse
and none would surprise a reader.

### Deployment context

Web is planned for Cloudflare and the server for Railway, with Postgres beside
it. Neither exists yet; both come up after the tracking MVP settles. Until then
Docker Compose is local development and the CI smoke test only. The build-time
guard in effort 0 is still worth having now, because Cloudflare will run the
same build later.

## Testing Decisions

A good test here drives the seam and asserts on what a caller can see. It sends
a request and reads the response. It does not reach past `createServer` to
inspect how the app was assembled, does not assert on the shape of the Hono
instance, and does not count connection pools. If a test needs to see past the
seam, the module is the wrong shape and the module should change, not the test.

- **Runner: Vitest**, installed at the workspace root, with a `test` task in the
  task graph. It was chosen over the Node built-in runner because the web app
  will need a runner too, and the built-in one needs a hand-maintained loader
  flag for TypeScript. The trade-off — one more dependency in a workspace that
  is otherwise careful about them — was accepted knowingly.
- **Module under test: `apps/server`, through `createServer`.** No other module
  is tested directly. `packages/db` and `packages/auth` are exercised through
  the same seam.
- **First test: boot and route.** Build the app with test configuration and
  request the root route in process. No network, no database. This alone proves
  the composition root works and that no module opens a connection at import.
- **Second test: sign-up against a real Postgres.** Drive the auth sign-up route
  through the same seam, against the container the workspace already runs. Sign
  up is the only behaviour the repository has, so it is the only behaviour worth
  covering. No fake database adapter is introduced: it would be the sole
  alternative adapter at a seam nothing else varies across.
- **Tests run in the pipeline, in two tasks.** The database-free test runs
  inside `pnpm run ci`, which must keep working on a laptop with no Docker. The
  sign-up test runs under its own task, which GitHub CI runs with Postgres up. A
  test the pipeline never runs is not a check, and a test that only runs on the
  maintainer's laptop does not protect the branch.
- **Tests release what they open.** A test closes the server through the
  disposal path rather than relying on a force-exit flag. A hanging test process
  means the seam's disposal path is wrong, and that is a defect in the module,
  not in the test.
- **The image smoke test stays.** It answers a different question — whether the
  runtime stage of the image carries every package the bundle imports — and an
  in-process test cannot answer it.
- **Prior art: none.** There is no test and no runner in the repository today.
  The conventions established here are the prior art for everything after.

## Out of Scope

- The design of the auth feature in the web app. The shared compiler policy was
  measured against it and surfaces no errors, so it needs no changes at all.
- Any finance feature — tracking, budgeting, forecasting. No schema work beyond
  what already exists.
- Creating `CONTEXT.md`. The plumbing work resolves no finance term, and a
  glossary written before the first feature would be a guess. It is written when
  the first feature forces a real definition.
- Generated migrations. Deferred by decision, with the trigger recorded in the
  third ADR.
- Standing up Cloudflare or Railway.
- Any change to the supply-chain policy: pinned digests, release age, trust
  policy, store integrity.

## Further Notes

- Two findings in this spec were verified by running the code, not by reading
  it. The web app was built twice, once with the server URL variable and once
  without: both exited 0, and the second inlined a configuration object with no
  such key, which throws in the browser at load. Separately, the server's type
  check was run against an empty output directory and left compiled JavaScript,
  declarations and a build-info file behind in it.
- One finding was added to the review's list during grilling: the server
  declares the database package as a dependency but no module under it imports
  the package.
- Commit scopes name a domain, not a package. Commits carry no co-author
  trailer.
- Every Markdown file touched must pass `pnpm format` and `pnpm lint:md`.
- The efforts were broken into nine tickets under `issues/`, which are the
  authority on order. Two things changed during that breakdown, both driven by
  measurement:
  - The configuration seam and the smoke test moved **ahead** of the composition
    root. The composition root removes the flag that skips validation from the
    container build, and `pnpm run smoke` is the only thing that proves the
    image still boots without it. Having it runnable first lets that ticket
    verify itself.
  - Putting the web app under the shared compiler policy turned out to need no
    source changes, so it stayed a single ticket rather than a batched
    expand-and-contract sequence.
- Five tickets can start immediately: remove the unused declarations, guard the
  web build, apply the shared compiler policy, check every package, and give the
  database URL one seam.
