FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY backend/package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY backend/ .

# Expose the port the app runs on
EXPOSE 5050

# Start the application
CMD ["node", "src/server.js"] 