# 06 — Make the image smoke test runnable by a human

**What to build:** `pnpm run smoke` builds the server image, starts the stack,
waits for it to become healthy, probes it, collects logs and cleans up — the
same way on a laptop and in CI. Today those steps exist only inside workflow
YAML, so a maintainer cannot reproduce a CI failure without pushing a commit,
and the values the server needs to boot are written down twice.

**Blocked by:** 05 — one seam for `DATABASE_URL`. Both change how the container
gets its database URL.

Status: ready-for-agent

- [ ] One script holds the build, start, wait, probe, log collection and
      cleanup.
- [ ] It seeds throwaway boot values from the documented example file rather
      than restating them.
- [ ] It never writes over or deletes an existing server environment file. If
      one is present, leave it exactly as found. The workflow version overwrites
      that file with a heredoc and deletes it afterwards, which on a laptop
      destroys the maintainer's own configuration.
- [ ] It runs under its own Compose project name and its own volume, separate
      from the development stack.
- [ ] It does not reuse any development-stack identifier. A separate project
      name is **not** enough on its own: the Compose file pins both container
      names, names the volume and the network explicitly, and binds fixed host
      ports. Every one of those is global, so a second stack collides with the
      first no matter what the project is called.
- [ ] Either the smoke stack overrides all of those identifiers — container
      names, volume name, network name and host port bindings — or the script
      detects a running development stack and stops with a clear message
      **before** it changes anything. Stopping safely is acceptable. Colliding
      is not.
- [ ] It never removes volumes belonging to the development stack. The workflow
      version tears down with volumes removed, which on a laptop destroys the
      local database and every row in it.
- [ ] Running it while a development stack is already up leaves that stack
      running and untouched.
- [ ] Running it twice in a row succeeds.
- [ ] It is exposed as `pnpm run smoke`.
- [ ] Cleanup runs even when the probe fails. Log collection never stops it.
- [ ] The workflow calls the script once and holds no copy of the steps.
- [ ] `pnpm run ci` does **not** call it. Docker is not always running on a
      laptop.
- [ ] Running it on a laptop with Docker up passes.

## Notes

Keep this even after a test runner arrives. It answers a question no in-process
test can: whether the runtime stage of the image carries every package the
bundle imports. That is a fact about the image, not about the code.

Ticket 07 depends on this one working, because it removes the flag that skips
validation from the container build. This script is how that change gets
verified.
