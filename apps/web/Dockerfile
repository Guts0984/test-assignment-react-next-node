FROM node:22-alpine
WORKDIR /repo
COPY packages/shared ./packages/shared
WORKDIR /repo/apps/web
COPY apps/web/package.json apps/web/package-lock.json ./
RUN npm ci
COPY apps/web/ ./
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=5432
EXPOSE 5432
CMD ["sh", "-c", "npm run build && npm run start"]
