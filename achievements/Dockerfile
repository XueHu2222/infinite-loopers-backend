# ================================
# Infinite Loopers - Achievements Service
# ================================

# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and prisma schema first
COPY code/package*.json ./
COPY code/prisma ./prisma

# Install dependencies without running postinstall
RUN npm ci --ignore-scripts
RUN npx prisma generate

# Copy source code
COPY code/ .

# ================================
# Production stage
# ================================
FROM node:20-alpine AS production

WORKDIR /app

# Install wget for health checks
RUN apk add --no-cache wget

# Copy from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src ./src
COPY --from=builder /app/package*.json ./

# Expose port
EXPOSE 3020

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3020

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3020/health || exit 1

# Start the application
CMD ["npx", "tsx", "src/start.ts"]
