# Frontend Dockerfile for React/Vite with Bun Preview
FROM node:22.12-alpine3.19

WORKDIR /app

# Accept build arguments
ARG VITE_BACKEND_URL=http://localhost:8000

# Copy package files and install dependencies
COPY package.json bun.lock* ./
RUN npm install -g bun && bun install --frozen-lockfile

# Copy source and build
COPY . .
# Create .env file with build args
RUN echo "VITE_BACKEND_URL=${VITE_BACKEND_URL}" > .env
RUN bun run build

# Expose port
EXPOSE 4173

# Start preview server
CMD ["bun", "run", "preview", "--host", "0.0.0.0"]