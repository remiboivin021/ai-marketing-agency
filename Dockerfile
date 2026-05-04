# Multi-stage Dockerfile for AI Marketing Agency (orchestration-execution)
# Stage 1: Build stage (compile frontend, install deps)
FROM node:18-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files first (better cache)
COPY package.json package-lock.json ./

# Install ALL dependencies (including devDependencies for build)
RUN npm install

# Copy source code
COPY . .

# Build frontend (Vite + React)
RUN npm run build

# Stage 2: Production stage
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install ONLY production dependencies
RUN npm install --production

# Copy built frontend from build stage
COPY --from=build /app/dist ./dist

# Copy server code
COPY server ./server
COPY .env.example ./
COPY docker-entrypoint.sh ./

# Create data directory for volume mount
RUN mkdir -p /app/data

# Expose the port (will be internal to Docker network, nginx handles external)
EXPOSE 3001

# Set environment to production
ENV NODE_ENV=production
ENV REDIS_URL=redis://redis:6379

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" || exit 1

# Run the server
CMD ["node", "server/index.js"]
