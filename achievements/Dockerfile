# Infinite Loopers - Achievements Service (SQLite)
FROM node:20-alpine

WORKDIR /app

# Install wget for health checks
RUN apk add --no-cache wget

# Copy package files and prisma
COPY code/package*.json ./
COPY code/prisma ./prisma

# Install dependencies
RUN npm ci --ignore-scripts
RUN npx prisma generate

# Copy source code
COPY code/src ./src

EXPOSE 3020
ENV NODE_ENV=production
ENV PORT=3020

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3020/health || exit 1

# Run migrations, seed database, and start app
CMD npx prisma migrate deploy && npx prisma db seed && npx tsx src/start.ts
