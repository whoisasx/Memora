# ---------- Stage 1: Build ----------
FROM node:22.12-alpine AS builder

WORKDIR /app
# ARG VITE_BACKEND_URL=http://localhost:8000
ARG VITE_BACKEND_URL=https://memora.asxcode.com

COPY package.json ./
RUN npm install -g bun && bun install --frozen-lockfile
COPY . .

RUN echo "VITE_BACKEND_URL=${VITE_BACKEND_URL}" > .env
RUN bun run build

# ---------- Stage 2: Serve ----------
FROM oven/bun:1.1.30-alpine AS runner

WORKDIR /app
COPY --from=builder /app/dist ./dist

EXPOSE 4173
CMD ["bun", "x", "serve", "-s", "dist", "-l", "4173"]
