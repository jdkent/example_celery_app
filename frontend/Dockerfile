# ---- Stage 1: Build assets with Node ----
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies (only production)
COPY package.json package-lock.json ./
RUN npm ci --only=production --legacy-peer-deps

# Copy source files and build assets
COPY index.html ./index.html
COPY src ./src/
RUN npx vite build
