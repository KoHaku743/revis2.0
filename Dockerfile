# Multi-stage build for React frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app/client

# Copy package files
COPY client/package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY client ./

# Build the application
RUN npm run build

# Backend stage
FROM node:20-alpine AS backend

WORKDIR /app/server

# Copy package files
COPY server/package*.json ./

# Install dependencies (production only)
RUN npm ci --only=production

# Copy source code
COPY server ./

# Production stage - combine both
FROM node:20-alpine

WORKDIR /app

# Install serve to run the frontend and express for backend
RUN npm install -g serve

# Create app directories
RUN mkdir -p /app/server /app/client/dist

# Copy backend from builder
COPY --from=backend /app/server /app/server

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
