# Docker Setup for iPhone Repair Tracking System

This project includes complete Docker configuration for development and production deployment.

## 🐳 Docker Files

- **`Dockerfile`** - Production-ready multi-stage build combining frontend and backend
- **`Dockerfile.backend`** - Backend-only development/production build
- **`client/Dockerfile`** - Frontend development build
- **`server/Dockerfile`** - Backend standalone production build
- **`docker-compose.yml`** - Complete development environment with PostgreSQL
- **`.dockerignore`** - Optimize build context
- **`.github/workflows/docker-build.yml`** - Automated CI/CD pipeline

## 🚀 Quick Start with Docker

### Option 1: Using Docker Compose (Recommended for Development)

```bash
# Clone the repository and navigate to it
cd revis2.0

# Create .env file with your configuration
cp server/.env.example .env.docker
cat > .env.docker << EOF
DB_USER=repair_user
DB_PASSWORD=repair_password
JWT_SECRET=dev_secret_change_in_production
GOOGLE_SHEET_ID=
GOOGLE_SERVICE_ACCOUNT_JSON={}
EOF

# Start all services (PostgreSQL, Backend, Frontend)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

Access:
- Frontend: http://localhost:5173 (or 5174 if port in use)
- Backend API: http://localhost:3001
- PostgreSQL: localhost:5432

### Option 2: Build Production Image

```bash
# Build the production image
docker build -t iphone-repair-system:latest .

# Run the container
docker run -d \
  --name repair-app \
  -p 3000:3000 \
  -p 3001:3001 \
  -e DATABASE_URL="postgresql://user:password@host:5432/repair_db" \
  -e JWT_SECRET="your-secure-secret" \
  -e GOOGLE_SHEET_ID="your-sheet-id" \
  -e GOOGLE_SERVICE_ACCOUNT_JSON='{}' \
  iphone-repair-system:latest

# Access
# Frontend: http://localhost:3000
# Backend API: http://localhost:3001
```

### Option 3: Build Individual Components

#### Build Backend Only
```bash
docker build -f Dockerfile.backend -t repair-backend:latest .
docker run -d -p 3001:3001 \
  -e DATABASE_URL="postgresql://..." \
  -e JWT_SECRET="..." \
  repair-backend:latest
```

#### Build Frontend Only
```bash
docker build -f client/Dockerfile -t repair-frontend:latest .
docker run -d -p 5173:5173 repair-frontend:latest
```

## 📋 Environment Variables

Create `.env.docker` or `.env` file:

```env
# Database Configuration
DB_USER=repair_user
DB_PASSWORD=repair_password
DATABASE_URL=postgresql://repair_user:repair_password@postgres:5432/repair_db

# JWT Secret
JWT_SECRET=your_secure_key_here_min_32_chars

# Google Sheets Integration
GOOGLE_SHEET_ID=your_sheet_id
GOOGLE_SERVICE_ACCOUNT_JSON={}

# Node Environment
NODE_ENV=production
PORT=3001
```

## 🔍 Useful Docker Commands

```bash
# View running containers
docker ps

# View container logs
docker logs -f <container_id>

# Execute command in container
docker exec -it <container_id> sh

# Stop container
docker stop <container_id>

# Remove container
docker rm <container_id>

# View image details
docker inspect <image_id>

# Prune unused images and containers
docker system prune -a
```

## 🐳 Docker Compose Services

```yaml
Services:
  1. postgres - PostgreSQL 15 on port 5432
  2. backend - Express API on port 3001
  3. frontend - React Vite on port 5173/5174
```

Database automatically:
- Initializes with schema from `server/migrations.sql`
- Persists data in named volume `postgres_data`
- Health checks enabled

## 🔄 GitHub Actions CI/CD

The included GitHub Actions workflow automatically:

1. **Triggers on:**
   - Push to main/develop branches
   - Pull requests to main
   - Version tags (v*)

2. **Builds three images:**
   - Full stack image
   - Backend image
   - Frontend image

3. **Pushes to:** GitHub Container Registry (GHCR)

4. **Image naming:**
   - `ghcr.io/username/revis2.0:latest`
   - `ghcr.io/username/revis2.0:v1.0.0`
   - `ghcr.io/username/revis2.0:main`
   - `ghcr.io/username/revis2.0:main-backend`
   - `ghcr.io/username/revis2.0:main-frontend`

### To enable CI/CD:

1. Push to GitHub repository
2. GitHub Actions automatically runs on push
3. Images pushed to GHCR (requires `packages: write` permission)

### Pull images from GHCR:

```bash
# Login to GitHub Container Registry
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# Pull image
docker pull ghcr.io/username/revis2.0:latest

# Run container
docker run -d -p 3000:3000 -p 3001:3001 ghcr.io/username/revis2.0:latest
```

## 📊 Image Sizes

- **Full stack:** ~450MB (multi-stage optimized)
- **Backend only:** ~250MB
- **Frontend only:** ~200MB

## 🛠️ Development with Docker

```bash
# Start development environment
docker-compose up

# Access container shell
docker-compose exec backend sh
docker-compose exec frontend sh
docker-compose exec postgres psql -U repair_user -d repair_db

# View database
docker-compose exec postgres psql -U repair_user -d repair_db -c "\dt"

# Rebuild after code changes
docker-compose build
docker-compose up
```

## 🚀 Deployment

### Deploy to Docker Hub

```bash
# Tag image
docker tag iphone-repair-system:latest yourusername/repair-system:v1.0.0

# Login to Docker Hub
docker login

# Push image
docker push yourusername/repair-system:v1.0.0
```

### Deploy to Cloud Providers

**AWS ECS:**
```bash
# Push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account>.dkr.ecr.us-east-1.amazonaws.com
docker tag iphone-repair-system:latest <account>.dkr.ecr.us-east-1.amazonaws.com/repair-system:latest
docker push <account>.dkr.ecr.us-east-1.amazonaws.com/repair-system:latest
```

**Google Cloud Run:**
```bash
gcloud auth configure-docker
docker tag iphone-repair-system:latest gcr.io/PROJECT_ID/repair-system:latest
docker push gcr.io/PROJECT_ID/repair-system:latest
gcloud run deploy repair-system --image gcr.io/PROJECT_ID/repair-system:latest
```

## ✅ Health Checks

Containers include health checks:

```bash
# Check container health
docker ps --format "table {{.Names}}\t{{.Status}}"

# Manual health check
curl http://localhost:3001/health
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Find process using port
lsof -i :5173
# Kill process
kill -9 <PID>
```

### Database Connection Error
```bash
# Check postgres logs
docker-compose logs postgres

# Verify connection string
docker-compose exec backend echo $DATABASE_URL
```

### Permission Denied
```bash
# Fix Docker socket permissions
sudo usermod -aG docker $USER
# Log out and log back in
```

### Out of Memory
```bash
# Limit container resources
docker run -m 512m <image>
```

## 📚 Additional Resources

- Docker Documentation: https://docs.docker.com
- Docker Compose: https://docs.docker.com/compose
- GitHub Actions: https://docs.github.com/en/actions
- GitHub Container Registry: https://docs.github.com/en/packages

---

**Next Steps:**
1. Configure `.env.docker` with your settings
2. Run `docker-compose up`
3. Access frontend at http://localhost:5173
4. Push to GitHub to trigger CI/CD pipeline
