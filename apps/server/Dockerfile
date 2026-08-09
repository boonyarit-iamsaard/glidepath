# Digest-pinned: `24-slim` is a mutable tag, so `--pull` could otherwise change a
# build input with no repository diff. Dependabot raises the digest bumps.
FROM node:24-slim@sha256:3638d9a6fe4030bd716be989438248074489337ba3275657f93595428be4fc03 AS base
WORKDIR /app

FROM base AS build
ENV SKIP_ENV_VALIDATION=1

# Honours the packageManager pin and its integrity hash; `npm i -g pnpm@11` would not.
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
RUN corepack install

# Reviewed: .dockerignore excludes VCS data, dependencies, build output, logs,
# deployment metadata, and every .env variant except documented examples.
COPY . .

RUN --mount=type=cache,target=/pnpm-store \
    pnpm install --frozen-lockfile --store-dir /pnpm-store

ENV NODE_ENV=production
RUN pnpm --filter server run build

# Collects the server package and only its production dependencies. The bundle
# still imports hono, better-auth, zod, and dotenv, so dist alone is not enough.
# --legacy: the workspace does not set inject-workspace-packages, and the
# @glidepath/* packages are already bundled into dist, so injection buys nothing.
RUN pnpm deploy --legacy --filter server --prod /prod/server

FROM base AS runtime
ENV NODE_ENV=production

# `pnpm deploy` packs the package like a publish, and dist is git-ignored, so the
# build output comes across separately. src and the build config stay behind.
COPY --from=build --chown=node:node /prod/server/package.json ./package.json
COPY --from=build --chown=node:node /prod/server/node_modules ./node_modules
COPY --from=build --chown=node:node /app/apps/server/dist ./dist

USER node

EXPOSE 4000

CMD ["node", "dist/index.mjs"]
