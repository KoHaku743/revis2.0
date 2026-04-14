# Multi-stage build for React frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Copy root workspace files (includes package-lock.json) and client package.json
COPY package.json package-lock.json ./
COPY client/package.json ./client/

# Install client workspace dependencies from lockfile
RUN npm ci --workspace=client

# Copy source code
COPY client ./client

# Build the application
RUN npm run build --workspace=client

# Backend stage
FROM node:20-alpine AS backend

WORKDIR /app

# Copy root workspace files (includes package-lock.json) and server package.json
COPY package.json package-lock.json ./
COPY server/package.json ./server/

# Install server workspace dependencies (production only) from lockfile
RUN npm ci --workspace=server --omit=dev

# Copy source code
COPY server ./server

# Production stage - combine both
FROM node:20-alpine

WORKDIR /app

# Install serve to run the frontend and express for backend
RUN npm install -g serve

# Create app directories
RUN mkdir -p /app/server /app/client/dist

# Copy backend source and workspace node_modules from builder
COPY --from=backend /app/server /app/server
COPY --from=backend /app/node_modules /app/node_modules

# Copy frontend build from builder
COPY --from=frontend-builder /app/client/dist /app/client/dist

# Set working directory to server
WORKDIR /app/server

# Expose ports
EXPOSE 3001 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start both backend and frontend
CMD ["sh", "-c", "node index.js & cd /app/client/dist && serve -s . -l 3000 & wait"]
