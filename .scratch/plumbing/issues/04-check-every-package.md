# 04 — Make the task graph check every package

**What to build:** A green `pnpm run types:check` means every package a
maintainer wrote was actually checked. Today the task graph reports the check as
non-existent for the environment, database, auth and config packages, so four
packages are only ever checked indirectly, inside the weaker program of whatever
app imports them. That is how a permanently dead escape hatch survived in the
web environment module.

**Blocked by:** None — can start immediately.

Status: ready-for-agent

- [ ] The environment, database and auth packages each gain a no-emit type
      check.
- [ ] The config package gains none. It holds no source.
- [ ] The database, auth and server packages drop the inert build config:
      composite projects, declarations, declaration maps and the output
      directory. No package has a build script and no config uses project
      references, so the build dependency in the task graph resolves to
      nothing.
- [ ] Source maps go too. A no-emit check emits nothing to map, so the setting
      describes absent behaviour exactly like the options above it.
- [ ] The server's type check becomes a no-emit check. Today it emits
      JavaScript, declarations and a build-info file into the directory the
      bundler owns and the task graph caches as build output.
- [ ] A dry run of the type-check task names a real command for every package
      that has source.
- [ ] `pnpm run ci` passes.
- [ ] The decision is recorded as ADR-0002: workspace packages are source-only.
      Note the rejected alternative — making them built modules with project
      references — and why: it would add a build step to serve a consumer that
      does not exist.

## Notes

Ordering constraint, measured before writing this ticket. Adding the type check
to the database package **without** first dropping its declaration emit fails
with two `TS2883` errors: the inferred type of the factory cannot be named
without referencing `Pool` from the Postgres types. Dropping the inert options
clears both. The two halves of this ticket cannot be separated.

This ticket and ticket 03 both edit the server's compiler config. There is no
logical dependency between them, but land one before starting the other.
