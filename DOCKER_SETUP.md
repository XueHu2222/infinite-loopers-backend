# Docker Setup Documentation - Infinite Loopers Backend

## Overview

This document explains the complete Docker containerization setup for the Infinite Loopers backend microservices architecture.

## Architecture

The backend consists of 5 microservices + 1 database:

| Service | Port | Description |
|---------|------|-------------|
| PostgreSQL | 5432 | Database |
| Users | 3012 | User authentication & management |
| Tasks | 3010 | Task management |
| Achievements | 3020 | Achievement tracking |
| Shop | 3014 | Shop functionality |
| API Gateway | 3011 | Routes requests to services |

---

## Files Created

### 1. Dockerfiles

Each microservice has its own Dockerfile that:
- Uses Node.js 20 Alpine (lightweight Linux)
- Installs dependencies
- Generates Prisma client (for database services)
- Sets up health checks
- Runs the application

#### Users Service (`users/Dockerfile`)

```dockerfile
# Infinite Loopers - Users Service (Simple)
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

EXPOSE 3012
ENV NODE_ENV=production
ENV PORT=3012

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3012/health || exit 1

CMD ["npx", "tsx", "src/start.ts"]
```

**Explanation:**
- `FROM node:20-alpine` - Uses Node.js 20 on Alpine Linux (small image size)
- `WORKDIR /app` - Sets working directory inside container
- `RUN apk add --no-cache wget` - Installs wget for health checks
- `COPY code/package*.json ./` - Copies package.json and package-lock.json
- `COPY code/prisma ./prisma` - Copies Prisma schema for database
- `RUN npm ci --ignore-scripts` - Installs dependencies (--ignore-scripts prevents postinstall issues)
- `RUN npx prisma generate` - Generates Prisma client
- `COPY code/src ./src` - Copies source code
- `EXPOSE 3012` - Documents the port (doesn't actually open it)
- `ENV` - Sets environment variables
- `HEALTHCHECK` - Docker checks if service is healthy every 30 seconds
- `CMD` - Command to start the application

#### Tasks Service (`tasks/Dockerfile`)

```dockerfile
# ================================
# Infinite Loopers - Tasks Service
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
EXPOSE 3010

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3010

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3010/health || exit 1

# Start the application
CMD ["npx", "tsx", "src/start.ts"]
```

#### Achievements Service (`achievements/Dockerfile`)

Same structure as Tasks, but with:
- `EXPOSE 3020`
- `ENV PORT=3020`
- Health check on port 3020

#### Shop Service (`shop/Dockerfile`)

Same structure as Tasks, but with:
- `EXPOSE 3014`
- `ENV PORT=3014`
- Health check on port 3014

#### API Gateway (`apigateway/Dockerfile`)

```dockerfile
# ================================
# Infinite Loopers - API Gateway
# ================================

# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY code/package*.json ./

# Install dependencies
RUN npm ci --ignore-scripts

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
COPY --from=builder /app/src ./src
COPY --from=builder /app/package*.json ./

# Expose port
EXPOSE 3011

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3011

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3011/health || exit 1

# Start the application
CMD ["npx", "tsx", "src/start.ts"]
```

**Note:** API Gateway doesn't have Prisma since it doesn't connect to the database directly.

---

### 2. Docker Ignore Files (`.dockerignore`)

Each service has a `.dockerignore` file to exclude unnecessary files from the Docker build:

**Location:** `users/.dockerignore`, `tasks/.dockerignore`, `achievements/.dockerignore`, `shop/.dockerignore`, `apigateway/.dockerignore`

```
node_modules
npm-debug.log
.git
.gitignore
.env
.env.*
*.md
.DS_Store
coverage
.nyc_output
*.log
.eslintcache
__tests__
*.test.ts
*.spec.ts
```

**Purpose:**
- Speeds up Docker builds by excluding large folders like `node_modules`
- Prevents sensitive files like `.env` from being copied into the image
- Excludes test files and logs

---

### 3. Docker Compose (`docker-compose.yml`)

The main orchestration file that defines all services and how they connect:

```yaml
services:
  # ================================
  # PostgreSQL Database
  # ================================
  postgres:
    image: postgres:15-alpine
    container_name: infinite-loopers-db
    environment:
      POSTGRES_USER: infiniteloopers
      POSTGRES_PASSWORD: infiniteloopers_dev_password
      POSTGRES_DB: infiniteloopers
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init-db.sql:/docker-entrypoint-initdb.d/init-db.sql
    networks:
      - infinite-loopers-backend
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U infiniteloopers"]
      interval: 10s
      timeout: 5s
      retries: 5

  # ================================
  # Users Service
  # ================================
  users:
    build:
      context: ./users
      dockerfile: Dockerfile
    container_name: infinite-loopers-users
    environment:
      DATABASE_URL: postgresql://infiniteloopers:infiniteloopers_dev_password@postgres:5432/infiniteloopers?schema=users
      PORT: 3012
      NODE_ENV: development
      JWT_SECRET: dev-jwt-secret-change-in-production
    ports:
      - "3012:3012"
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - infinite-loopers-backend
    restart: unless-stopped

  # ================================
  # Tasks Service
  # ================================
  tasks:
    build:
      context: ./tasks
      dockerfile: Dockerfile
    container_name: infinite-loopers-tasks
    environment:
      DATABASE_URL: postgresql://infiniteloopers:infiniteloopers_dev_password@postgres:5432/infiniteloopers?schema=tasks
      PORT: 3010
      NODE_ENV: development
      USERS_SERVICE_URL: http://users:3012
      ACHIEVEMENTS_SERVICE_URL: http://achievements:3020
    ports:
      - "3010:3010"
    depends_on:
      postgres:
        condition: service_healthy
      users:
        condition: service_started
    networks:
      - infinite-loopers-backend
    restart: unless-stopped

  # ================================
  # Achievements Service
  # ================================
  achievements:
    build:
      context: ./achievements
      dockerfile: Dockerfile
    container_name: infinite-loopers-achievements
    environment:
      DATABASE_URL: postgresql://infiniteloopers:infiniteloopers_dev_password@postgres:5432/infiniteloopers?schema=achievements
      PORT: 3020
      NODE_ENV: development
      USERS_SERVICE_URL: http://users:3012
    ports:
      - "3020:3020"
    depends_on:
      postgres:
        condition: service_healthy
      users:
        condition: service_started
    networks:
      - infinite-loopers-backend
    restart: unless-stopped

  # ================================
  # Shop Service
  # ================================
  shop:
    build:
      context: ./shop
      dockerfile: Dockerfile
    container_name: infinite-loopers-shop
    environment:
      DATABASE_URL: postgresql://infiniteloopers:infiniteloopers_dev_password@postgres:5432/infiniteloopers?schema=shop
      PORT: 3014
      NODE_ENV: development
      USERS_SERVICE_URL: http://users:3012
    ports:
      - "3014:3014"
    depends_on:
      postgres:
        condition: service_healthy
      users:
        condition: service_started
    networks:
      - infinite-loopers-backend
    restart: unless-stopped

  # ================================
  # API Gateway
  # ================================
  apigateway:
    build:
      context: ./apigateway
      dockerfile: Dockerfile
    container_name: infinite-loopers-gateway
    environment:
      PORT: 3011
      NODE_ENV: development
      USERS_SERVICE_URL: http://users:3012
      TASKS_SERVICE_URL: http://tasks:3010
      ACHIEVEMENTS_SERVICE_URL: http://achievements:3020
      SHOP_SERVICE_URL: http://shop:3014
    ports:
      - "3011:3011"
    depends_on:
      - users
      - tasks
      - achievements
      - shop
    networks:
      - infinite-loopers-backend
    restart: unless-stopped

networks:
  infinite-loopers-backend:
    driver: bridge

volumes:
  postgres_data:
```

**Key Concepts:**

1. **`services`** - Defines each container
2. **`build.context`** - Where to find the Dockerfile
3. **`environment`** - Environment variables passed to the container
4. **`ports`** - Maps container port to host port (`host:container`)
5. **`depends_on`** - Ensures services start in correct order
6. **`condition: service_healthy`** - Waits for health check to pass
7. **`networks`** - All services share a network so they can communicate
8. **`volumes`** - Persists database data between restarts

---

### 4. Database Initialization (`init-db.sql`)

Creates separate schemas for each microservice:

```sql
-- ================================
-- Infinite Loopers Database Initialization
-- Creates separate schemas for each microservice
-- ================================

-- Create schemas for each microservice
CREATE SCHEMA IF NOT EXISTS users;
CREATE SCHEMA IF NOT EXISTS tasks;
CREATE SCHEMA IF NOT EXISTS achievements;
CREATE SCHEMA IF NOT EXISTS shop;

-- Grant permissions
GRANT ALL ON SCHEMA users TO infiniteloopers;
GRANT ALL ON SCHEMA tasks TO infiniteloopers;
GRANT ALL ON SCHEMA achievements TO infiniteloopers;
GRANT ALL ON SCHEMA shop TO infiniteloopers;

-- Log completion
DO $$
BEGIN
  RAISE NOTICE 'Database schemas created successfully';
END $$;
```

**Purpose:**
- Each microservice has its own schema (namespace) in the database
- Keeps data organized and separated
- Runs automatically when PostgreSQL container starts for the first time

---

### 5. Health Check Endpoints

Added to each service's `start.ts` file:

```typescript
// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    service: 'users',  // Different for each service
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
```

**Purpose:**
- Docker uses this to check if the service is running
- Load balancers can check service health
- Monitoring tools can track uptime
- Returns JSON with service status, name, timestamp, and uptime

---

### 6. Production Docker Compose (`docker-compose.prod.yml`)

For production deployment with environment variables:

```yaml
services:
  postgres:
    image: postgres:15-alpine
    container_name: infinite-loopers-db-prod
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    volumes:
      - postgres_data_prod:/var/lib/postgresql/data
      - ./init-db.sql:/docker-entrypoint-initdb.d/init-db.sql
    networks:
      - infinite-loopers-backend-prod
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: always

  # ... similar structure for other services
  # Uses ${VARIABLE} syntax for secrets

networks:
  infinite-loopers-backend-prod:
    driver: bridge

volumes:
  postgres_data_prod:
```

**Difference from development:**
- Uses environment variables (`${DB_USER}`) instead of hardcoded values
- Uses `restart: always` for automatic recovery
- Separate volume names to avoid conflicts

---

## How to Use

### Build all images
```bash
docker compose build
```

### Start all services
```bash
docker compose up
```

### Start in background (detached)
```bash
docker compose up -d
```

### View logs
```bash
docker compose logs           # All services
docker compose logs users     # Specific service
docker compose logs -f        # Follow logs in real-time
```

### Stop all services
```bash
docker compose down
```

### Stop and remove volumes (reset database)
```bash
docker compose down -v
```

### Rebuild a specific service
```bash
docker compose build users
docker compose up users
```

### Check running containers
```bash
docker compose ps
```

---

## Testing the Setup

### Test health endpoints
```bash
curl http://localhost:3012/health   # Users
curl http://localhost:3010/health   # Tasks
curl http://localhost:3020/health   # Achievements
curl http://localhost:3014/health   # Shop
curl http://localhost:3011/health   # API Gateway
```

### Expected response
```json
{
  "status": "ok",
  "service": "users",
  "timestamp": "2026-01-18T12:17:46.251Z",
  "uptime": 99.491880676
}
```

---

## Service Communication

Services communicate using Docker's internal DNS:

| From | To | URL |
|------|-----|-----|
| Tasks | Users | `http://users:3012` |
| Tasks | Achievements | `http://achievements:3020` |
| API Gateway | All services | `http://[service-name]:[port]` |

**Note:** Inside Docker network, use service names (e.g., `users`) not `localhost`.

---

## Troubleshooting

### Container won't start
```bash
docker compose logs [service-name]
```

### Database connection issues
- Ensure PostgreSQL is healthy: `docker compose ps`
- Check if schemas exist: Connect to database and run `\dn`

### Port already in use
```bash
# Find what's using the port
netstat -ano | findstr :3012

# Or change port in docker-compose.yml
ports:
  - "3013:3012"  # Maps to different host port
```

### Rebuild from scratch
```bash
docker compose down -v
docker system prune -a
docker compose build --no-cache
docker compose up
```

---

## Summary

| File | Purpose |
|------|---------|
| `*/Dockerfile` | Build instructions for each service |
| `*/.dockerignore` | Files to exclude from Docker build |
| `docker-compose.yml` | Orchestrates all services for development |
| `docker-compose.prod.yml` | Production configuration |
| `init-db.sql` | Creates database schemas |
| Health endpoints | Allows Docker to monitor service health |
