# 07 — Give the server a composition root, tested through it

**What to build:** A maintainer can read one function and see everything the
server does, and a test can drive the whole runtime in process without a
network. Today importing a module starts a database connection: the database and
auth packages each build and export a live instance at load, so neither can be
loaded without live configuration, and the auth package opens a second
connection pool while the first is never queried. The container build only works
because it switches validation off.

**Blocked by:** 04 — check every package. 06 — runnable smoke test.

Status: ready-for-agent

- [ ] The database package exports a factory taking a connection string. Its
      module-level instance is deleted and it no longer imports the environment
      module.
- [ ] The auth package exports a factory taking a database and a narrow config
      — the secret, the base URL and the trusted origin, nothing more. Its
      module-level instance is deleted and it no longer imports the environment
      module.
- [ ] The server declares the database package as a direct dependency again.
      Ticket 01 removed it because nothing imported it; the composition root
      imports the database factory directly, so it becomes real here.
- [ ] The server exports `createServer(config)`, which builds the app and
      returns it **without** listening.
- [ ] `createServer` also returns a way to close what it opened. The caller
      must not need to know a connection pool exists in order to release it:
      the entry point closes on shutdown, a test closes in teardown.
- [ ] The server's entry point reads the environment once, calls
      `createServer`, and starts it.
- [ ] Configuration is threaded as narrow parameters. Do not pass the whole
      parsed environment down. A module's interface states what it needs and
      nothing else.
- [ ] Exactly one connection pool exists per running server.
- [ ] The container build no longer sets the flag that skips validation.
- [ ] Vitest is installed at the workspace root with a task in the task graph,
      and `pnpm test` runs it.
- [ ] One test builds the app with test configuration and requests the root
      route in process — no network, no database. This alone proves no module
      opens a connection at import.
- [ ] That test runs as part of `pnpm run ci`. A test the pipeline does not run
      is not a check. `pnpm run ci` must still work on a laptop with no Docker,
      so only the database-free test belongs in it.
- [ ] After a test closes the server, the test process exits on its own. Do not
      reach for a force-exit flag — a hanging process means the disposal path is
      wrong.
- [ ] `pnpm run smoke` passes, proving the image still boots without the flag.
- [ ] `pnpm run ci` passes.
- [ ] The decision is recorded as ADR-0001: the server is composed at one root
      and packages export factories, never instances. Note that this departs
      from the upstream scaffold on purpose, so a future reader does not restore
      the old pattern.

## Notes

`createServer` is the workspace's one seam and the highest one available. Tests
drive it through the returned app's request method and assert on responses. Do
not reach past it to inspect how the app was assembled, and do not assert on the
shape of the app object or count pools directly. If a test needs to see past the
seam, the module is the wrong shape — change the module, not the test.

The factories are deliberately **not** seams. Each has one adapter and no second
is planned, so an interface at either point would exist only to serve a test.

Vitest was chosen over the Node built-in runner because the web app will need a
runner too, and the built-in one needs a hand-maintained loader flag for
TypeScript. That is one more dependency in a workspace that is otherwise careful
about them, and the trade-off was accepted knowingly.
