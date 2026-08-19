# 08 — Cover sign-up through the seam against a real Postgres

**What to build:** The only behaviour the repository has today is covered end to
end. A maintainer can change how the server is composed, how the database is
opened or how auth is configured, and a failing test tells them they broke sign
up.

**Blocked by:** 07 — the composition root.

Status: ready-for-agent

- [ ] A test drives the sign-up route through `createServer`, against a real
      Postgres — the container the workspace already runs.
- [ ] The test asserts on the response a caller can see. It does not inspect
      how the app was assembled and does not query the database to check rows.
- [ ] The test leaves the database in the state it found it, so it can run
      twice in a row.
- [ ] No fake database adapter is introduced. It would be the sole alternative
      adapter at a seam nothing else varies across.
- [ ] The test closes the server it built, through the disposal path ticket 07
      established, so the test process exits on its own.
- [ ] The test is skipped or fails with a clear message when no database is
      running, rather than hanging.
- [ ] It runs under its own task, separate from the database-free test, because
      `pnpm run ci` must keep working on a laptop with no Docker.
- [ ] GitHub CI runs that task with Postgres up. A test that only ever runs on
      the maintainer's laptop does not protect the branch.
- [ ] `pnpm test` passes with the local container up.

## Notes

Sign up is the only behaviour the repository has, so it is the only behaviour
worth covering now. This ticket establishes the conventions every later feature
test follows — there is no prior art in the repository.
