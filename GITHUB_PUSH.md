# Push to GitHub Guide

This guide explains how to push your iPhone Repair Tracking System to GitHub and enable automated Docker builds.

## Prerequisites

- GitHub account (https://github.com)
- Git installed locally
- Access to this repository

## Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Fill in repository details:
   - **Repository name**: `revis2.0` (or your preferred name)
   - **Description**: "iPhone Repair Tracking System - Full-stack repair tracking with Docker support"
   - **Public/Private**: Choose based on preference
   - **Skip**: "Initialize this repository with..." (we already have files)
3. Click "Create repository"

## Step 2: Add GitHub Remote

```bash
cd /Users/jankarchnak/revis2.0

# Add the remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/revis2.0.git

# Verify remote was added
git remote -v
```

Expected output:
```
origin  https://github.com/YOUR_USERNAME/revis2.0.git (fetch)
origin  https://github.com/YOUR_USERNAME/revis2.0.git (push)
```

## Step 3: Rename Branch (if needed) and Push

```bash
# Rename to main if needed
git branch -M main

# Push to GitHub
git push -u origin main
```

If authentication fails, you'll need to:
- Use GitHub personal access token instead of password
- Or configure SSH keys

### Option A: Using Personal Access Token

```bash
# Generate token at: https://github.com/settings/tokens
# Click "Generate new token (classic)"
# Select scopes: repo, workflow, write:packages
# Copy the token

# When prompted for password, paste the token instead
git push -u origin main
```

### Option B: Using SSH

```bash
# Generate SSH key if you don't have one
ssh-keygen -t ed25519 -C "your_email@example.com"

# Add key to GitHub: https://github.com/settings/keys
# Then use SSH remote instead
git remote remove origin
git remote add origin git@github.com:YOUR_USERNAME/revis2.0.git
git push -u origin main
```

## Step 4: Verify Push

1. Go to https://github.com/YOUR_USERNAME/revis2.0
2. You should see all files and folders
3. Check the initial commit in the commit history

## Step 5: Enable GitHub Actions

The Docker build pipeline is already configured but needs to be activated:

1. Go to your repository
2. Click **Settings** tab
3. Click **Actions** → **General** (in left sidebar)
4. Under "Actions permissions", select **Allow all actions and reusable workflows**
5. Click **Save**

## Step 6: Configure Container Registry Access

GitHub uses GITHUB_TOKEN automatically, but verify permissions:

1. Go to **Settings** → **Actions** → **General**
2. Scroll to "Workflow permissions"
3. Ensure **Read and write permissions** is selected
4. Ensure **Allow GitHub Actions to create and approve pull requests** is checked

## Step 7: Monitor Docker Builds

Once you push to GitHub:

1. Go to the **Actions** tab in your repository
2. You'll see "Build and Push Docker Image" workflow running
3. Wait for all jobs to complete:
   - build-and-push
   - build-backend
   - build-frontend

Successful builds will have ✅ next to each job.

## Step 8: Access Your Docker Images

Once builds complete, your Docker images are available at:

```bash
# Full stack image
ghcr.io/YOUR_USERNAME/revis2.0:latest
ghcr.io/YOUR_USERNAME/revis2.0:main

# Backend only
ghcr.io/YOUR_USERNAME/revis2.0:main-backend

# Frontend only
ghcr.io/YOUR_USERNAME/revis2.0:main-frontend
```

### Pull Images

```bash
# Login to GitHub Container Registry
echo $GITHUB_TOKEN | docker login ghcr.io -u YOUR_USERNAME --password-stdin

# Pull the latest image
docker pull ghcr.io/YOUR_USERNAME/revis2.0:latest

# Run the container
docker run -d \
  --name repair-app \
  -p 3000:3000 -p 3001:3001 \
  -e DATABASE_URL="postgresql://..." \
  -e JWT_SECRET="your-secret" \
  ghcr.io/YOUR_USERNAME/revis2.0:latest
```

## Step 9: View Packages

To see your published Docker images:

1. Go to your repository
2. Click **Packages** (on the right sidebar)
3. Click the package to view versions and pull instructions

## Troubleshooting

### Push Fails with Authentication Error

**Solution:**
- Use GitHub personal access token (not password)
- Generate at https://github.com/settings/tokens
- Or set up SSH keys

### Actions Not Running

**Solution:**
1. Check **Settings** → **Actions** → **General**
2. Ensure "Allow all actions and reusable workflows" is selected
3. Verify `.github/workflows/docker-build.yml` exists in main branch

### Docker Push Fails in Actions

**Solution:**
1. Verify "Workflow permissions" has "Read and write permissions"
2. Check that GITHUB_TOKEN is available (it is by default)
3. Ensure image names are lowercase (GitHub requires this)

### Container Registry Login Fails

**Solution:**
```bash
# Generate a personal access token with read:packages, write:packages
# Then login:
echo $GITHUB_TOKEN | docker login ghcr.io -u YOUR_USERNAME --password-stdin
```

## Continuous Deployment

The workflow automatically builds and pushes on:
- **Push to main/develop** branches
- **Pull requests** to main (image not pushed, only built)
- **Version tags** (e.g., `git tag v1.0.0 && git push --tags`)

## Example: Deploy Latest Version

After pushing to GitHub:

```bash
# Pull latest image
docker pull ghcr.io/YOUR_USERNAME/revis2.0:latest

# Stop old container
docker stop repair-app 2>/dev/null || true
docker rm repair-app 2>/dev/null || true

# Run new container
docker run -d \
  --name repair-app \
  -p 3000:3000 -p 3001:3001 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/repair_db" \
  -e JWT_SECRET="your-secure-key" \
  -e GOOGLE_SHEET_ID="your-sheet-id" \
  ghcr.io/YOUR_USERNAME/revis2.0:latest

# Check status
docker ps
docker logs -f repair-app
```

## Local Development with Docker

While images build automatically on GitHub, you can also build locally:

```bash
# Build production image locally
docker build -t iphone-repair-system:dev .

# Run locally
docker run -d \
  --name repair-dev \
  -p 3000:3000 -p 3001:3001 \
  -e DATABASE_URL="postgresql://localhost/repair_db" \
  -e JWT_SECRET="dev-secret" \
  iphone-repair-system:dev

# Or use Docker Compose
docker-compose up -d

# Access
# Frontend: http://localhost:5173
# Backend: http://localhost:3001
# Database: localhost:5432
```

## Next Steps

✅ Push to GitHub
✅ Wait for Docker builds to complete
✅ Pull images from GHCR
✅ Deploy to cloud provider or local server
✅ Monitor with GitHub Actions logs

---

**Questions?** Check DOCKER.md for detailed Docker documentation.
