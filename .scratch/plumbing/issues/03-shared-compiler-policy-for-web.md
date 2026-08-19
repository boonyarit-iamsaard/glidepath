# 03 — Put the web app under the shared compiler policy

**What to build:** One file sets the compiler policy for every package in the
workspace. Today the largest app declares its own weaker policy, so the code
written most is checked least — it misses unchecked index access, unused locals
and parameters, verbatim module syntax, isolated modules, fall-through cases and
consistent file-name casing.

**Blocked by:** None — can start immediately.

Status: ready-for-agent

- [ ] The web app extends the shared config package.
- [ ] Its override keeps only what is genuinely its own: the JSX setting, the
      DOM libraries, the Vite client types, its own path alias and its root
      dirs.
- [ ] The duplicate path alias for the shared UI package is deleted. Every
      import the web app makes is already resolved by that package's `exports`
      map.
- [ ] The server drops its JSX compiler options. It has no JSX.
- [ ] `pnpm run types:check` passes with no source file changed.
- [ ] `pnpm run ci` passes.

## Notes

Measured before writing this ticket. With the DOM libraries added and the types
left as the Vite client types, this produces **zero** type errors and needs no
source changes.

Get those two settings wrong and you get 15 errors, all of them symptoms rather
than faults: the shared policy sets Node types and no DOM libraries, so `window`
and `document` go missing and `KeyboardEvent` resolves to Node's global instead
of the DOM one. The UI package's own config already solves this exactly this
way. Copy that pattern.

This ticket and ticket 04 both edit the server's compiler config. There is no
logical dependency between them, but land one before starting the other.
