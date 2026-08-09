# Prune the server runtime image

Status: ready-for-agent

The multi-stage build in `apps/server/Dockerfile` cut the image from 1.86 GB to
476 MB. The runtime stage is smaller, but it is not clean.

## What the runtime still carries

An inspection of the built image found three groups of files the server never
loads:

- Workspace source under `node_modules/@glidepath/*`. Those packages export
  TypeScript from `src`, and `pnpm deploy` copies the whole directory. The
  server does not need them: `deps.alwaysBundle` in `apps/server/tsdown.config.ts`
  already inlines every `@glidepath/*` package into `dist/index.mjs`.
- `typescript`, `tsx`, `esbuild`, and `drizzle-kit` under `node_modules/.pnpm`.
  These are not a `--prod` failure. Every declared development dependency was
  excluded. They arrive as optional peer dependencies of the production graph:
  `pnpm why -r --prod drizzle-kit` traces it to `better-auth`, which declares
  `drizzle-kit >=0.31.4` as an optional peer.
- `npm` and `corepack` under `/usr/local/lib/node_modules`, from the base image.

## What the bundle actually needs

`dist/index.mjs` imports only `dotenv/config`, `zod`, `better-auth`,
`better-auth/adapters/drizzle`, `@hono/node-server`, `hono`, `hono/cors`, and
`hono/logger`. `@t3-oss/env-core`, `drizzle-orm`, and `pg` are already inlined,
because tsdown follows the transitive graph of the bundled workspace packages.

## Approach

Try full bundling first: widen `deps.alwaysBundle` so `dist` is self-contained
and the runtime stage needs no `node_modules` at all.

Two known risks. `pg` calls `require("pg-native")` at run time. `better-auth`
loads adapters dynamically. If either breaks the bundle, fall back to pruning
the deployed `node_modules` instead of bundling, and record why.

If the first attempt fights back, the question is faster to answer in code than
in discussion. Spike it rather than grind on it.

## Acceptance criteria

- The runtime stage contains no `@glidepath/*` source.
- The runtime stage contains no build-oriented package: `typescript`, `tsx`,
  `esbuild`, `drizzle-kit`.
- The image is smaller than 476 MB. Record the measured size.
- The CI smoke test still passes: the server starts and `GET /` returns `200`.
- The server still runs as the non-root `node` user.

## Notes

`npm` and `corepack` come from `node:24-slim` itself. Removing them means
choosing a different base image, which is a separate decision. Leave them.
