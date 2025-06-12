FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY backend/package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the application
COPY backend/src ./src

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5050

# Expose port
EXPOSE 5050

# Start command
CMD ["node", "src/server.js"] 