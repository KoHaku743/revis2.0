FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Expose frontend port
EXPOSE 5173 5174

# Start frontend dev server
CMD ["npm", "run", "dev", "--workspace=client"]
