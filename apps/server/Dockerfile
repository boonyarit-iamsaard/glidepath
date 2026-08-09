FROM node:26-slim AS base
COPY --from=oven/bun:1 /usr/local/bin/bun /usr/local/bin/bun
WORKDIR /app
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
RUN cd apps/server && pnpm run build
ENV SKIP_ENV_VALIDATION=

USER node

EXPOSE 3000

WORKDIR /app/apps/server
CMD ["bun", "dist/index.mjs"]
