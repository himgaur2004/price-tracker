FROM node:18-alpine

WORKDIR /app

# Copy only the backend directory
COPY backend ./

# Install dependencies
RUN cd /app && npm install --production

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5050

# Expose the port
EXPOSE 5050

# Start the application
CMD ["node", "src/server.js"] 