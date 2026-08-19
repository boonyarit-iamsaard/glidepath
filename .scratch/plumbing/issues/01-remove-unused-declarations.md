# 01 — Remove the declarations nothing uses

**What to build:** The dependency lists, the root manifest and the README
describe what the code actually does. A maintainer reading a package's
dependencies learns what that package imports, and nothing else.

**Blocked by:** None — can start immediately.

Status: ready-for-agent

- [ ] The web app no longer declares the form resolver package. It uses a
      different form library.
- [ ] The web app, the auth package and the root manifest no longer declare
      `dotenv`. Only the environment module imports it.
- [ ] The database package and the auth package no longer declare `zod`.
      Neither imports it.
- [ ] The server no longer declares the database package. Today it reaches the
      database module through the auth package, which the bundler inlines.
      Ticket 07 makes this dependency real again and restores it — see Notes.
- [ ] The root manifest no longer declares the environment package or `zod`.
      The workspace root holds no source and imports neither.
- [ ] The root manifest no longer carries a `workspaces` field. pnpm reads
      `pnpm-workspace.yaml` and ignores it.
- [ ] The README project structure lists the environment package and the
      config package.
- [ ] `pnpm install --frozen-lockfile` succeeds and the lockfile is updated in
      the same change.
- [ ] `pnpm run ci` passes.

## Notes

Two removals that look like they belong here are deliberately elsewhere. The
server's JSX compiler options go with the compiler policy work in ticket 03.
The web environment module's dead escape hatch goes with ticket 09.

The database package's `dotenv` dependency stays for now. Ticket 05 removes the
import that uses it, and removes the dependency with it.

Removing the server's dependency on the database package is correct **at this
point in the sequence** and wrong afterwards. Ticket 07 gives the server a
composition root that calls the database factory directly, so it carries an
explicit criterion to restore the dependency. Each ticket is therefore truthful
on its own. Do not skip either half.
