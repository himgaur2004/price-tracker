FROM node:18-alpine

WORKDIR /app

# Copy backend package files
COPY backend/package*.json ./

# Install production dependencies
RUN npm install --production

# Copy backend source code
COPY backend/src ./src

# Create a directory for logs (if needed)
RUN mkdir -p /app/logs

# Expose the port the app runs on
EXPOSE 5050

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5050

# Health check configuration
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:5050/ || exit 1

# Start the application
CMD ["node", "src/server.js"] 