# STAGE 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# STAGE 2: Builder
FROM deps AS builder
WORKDIR /app
COPY . .
ENV DATABASE_URL="mysql://dummy:dummy@db:3306/dummy"
RUN pnpm exec prisma generate
RUN pnpm build

# STAGE 3: Production dependencies
FROM node:20-alpine AS prod-deps
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile

# STAGE 4: Production runtime
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5000

COPY --chown=node:node --from=prod-deps /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/dist ./dist
COPY --chown=node:node --from=builder /app/prisma ./prisma
COPY --chown=node:node --from=builder /app/generated ./generated
COPY --chown=node:node package.json ./package.json

USER node

EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "const host=require('os').hostname(); require('http').get({host, port:5000, path:'/health'}, (r) => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

CMD ["node", "dist/src/server.js"]
