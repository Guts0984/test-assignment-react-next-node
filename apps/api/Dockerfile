# Build — context must be the repo root (build imports packages/shared)
FROM node:22-alpine AS builder
WORKDIR /repo
COPY apps/api/package*.json apps/api/
COPY packages/shared packages/shared
WORKDIR /repo/apps/api
RUN npm ci
COPY apps/api .
RUN npm run build

# Production
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY apps/api/package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=builder --chown=node:node /repo/apps/api/dist ./dist
USER node
EXPOSE 3000
CMD ["node", "dist/apps/api/src/server.js"]
