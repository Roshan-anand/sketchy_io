FROM oven/bun AS base
WORKDIR /app

FROM base AS install
COPY package.json .
COPY bun.lock .
RUN bun install --frozen-lockfile

FROM base AS build
ENV NODE_ENV=production
COPY --from=install /app/node_modules ./node_modules
COPY . .
RUN bun test
RUN bun run build

FROM base AS release
ENV NODE_ENV=production
COPY --from=build /app/dist/index.js ./index.js
COPY --from=build /app/node_modules ./node_modules

EXPOSE 3000/tcp
ENTRYPOINT [ "bun", "run", "index.js" ]
