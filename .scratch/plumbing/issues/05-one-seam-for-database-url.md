# 05 — Give `DATABASE_URL` one seam

**What to build:** A missing database URL fails once, loudly, at the
environment module — not deep inside the driver. Today the migration tool
reaches around that module: it loads another app's `.env` file by relative path
and turns a missing URL into an empty string, which the driver then tries to
connect with.

**Blocked by:** None — can start immediately.

Status: ready-for-agent

- [ ] The environment package exposes a **narrow** database configuration —
      the database URL and nothing else. A migration must not fail because an
      unrelated auth variable is absent.
- [ ] The database URL has **one** schema declaration, reused by both the
      narrow database configuration and the full server configuration. Two
      declarations of the same variable is the fault this ticket exists to
      remove, not a shape to reproduce inside the environment package.
- [ ] The migration tool's config reads the database URL through that narrow
      configuration, so the environment package stays the one module that owns
      configuration.
- [ ] The environment file is resolved from the config file's own location, not
      from the working directory. See the ordering trap below.
- [ ] The empty-string fallback is deleted. A missing URL fails validation with
      a message naming the variable.
- [ ] Docker Compose derives the database URL from the same variables rather
      than restating it as a literal.
- [ ] `pnpm run db:push` works from the workspace root **and** from inside the
      database package. Both are documented entry points.
- [ ] `pnpm run db:studio` and `pnpm run db:generate` still work.
- [ ] The database package no longer declares `dotenv` if nothing in it imports
      the package any more.
- [ ] `pnpm run ci` passes.
- [ ] The decision is recorded as ADR-0003: the schema reaches the database
      with a direct push, not generated migrations. Record the revisit
      condition explicitly — adopt generated migrations before the first deploy
      that holds transactions the maintainer would mind losing, which is when
      the tracking MVP settles. Record why it is safe today: no hosted database
      exists yet.

## The ordering trap

Reproduced before writing this ticket. The server environment module loads
`dotenv/config` at import, which resolves the environment file **relative to the
working directory**. Turbo runs the database tasks from inside the database
package, where no such file exists.

Importing the server environment module from that working directory therefore
throws, reporting every variable as undefined — including the database URL. A
naive fix that deletes the current relative path and imports the environment
module instead **breaks every documented database command**.

The current code works only by accident: the hand-written relative path happens
to match the working directory turbo sets. Change the working directory and it
breaks just as badly.

So this ticket must state where the environment file is loaded from and load it
before configuration is read. Resolve it from the config file's own location so
it holds no matter which directory the command runs in.

## Notes

The migration task is marked persistent in the task graph. That is wrong for a
task that runs once and exits. Fix it here if it is in the way; otherwise leave
it for when migrations are actually adopted.

The narrow-configuration shape was reviewed and approved by the maintainer: it
keeps validation local to the database and stops unrelated auth settings from
entering the migration interface.
