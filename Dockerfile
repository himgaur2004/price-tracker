# Build stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /build

# Copy package files
COPY backend/package*.json ./

# Install dependencies
RUN npm install --production

# Copy source code
COPY backend/src ./src

# Production stage
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy built files from builder
COPY --from=builder /build/node_modules ./node_modules
COPY --from=builder /build/src ./src

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5050

# Expose port
EXPOSE 5050

# Start command
CMD ["node", "src/server.js"] 