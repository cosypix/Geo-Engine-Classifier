FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

# Install only production dependencies if we were building for prod, 
# but for dev we install everything.
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 8000

# Start server
CMD ["npm", "run", "dev"]
