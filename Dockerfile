FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY backend/package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the application
COPY backend/src ./src

# Expose the port the app runs on
EXPOSE 5050

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5050

# Start the application
CMD ["node", "src/server.js"] 