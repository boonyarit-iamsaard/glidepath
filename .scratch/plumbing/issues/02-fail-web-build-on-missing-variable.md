# 02 — Fail the web build when a required variable is missing

**What to build:** Building the web app without its server URL stops the build,
in Node, with a message naming the missing variable. Today that build exits 0
and produces a bundle that throws in the browser at load, on a white page. CI
builds exactly that bundle and calls it a pass, and the planned Cloudflare
deployment would run the same build.

**Blocked by:** None — can start immediately.

Status: ready-for-agent

- [ ] The environment package exports its web schema as a value in its own
      right, separate from the parsed result, so a build tool can reuse it.
- [ ] The web app's build config loads the environment and validates it with
      that same schema, at build time, in Node.
- [ ] A build with no server URL set exits non-zero and names the variable.
- [ ] A build with the variable set succeeds and is unchanged.
- [ ] The browser-side validation stays in place as a second net.
- [ ] The variable is declared in exactly one place. Do not restate the schema
      in the build config.
- [ ] `pnpm run ci` passes.

## Notes

Verified before writing this ticket: the web app was built twice, once with the
variable and once without. Both exited 0. The second inlined a configuration
object with no such key.
