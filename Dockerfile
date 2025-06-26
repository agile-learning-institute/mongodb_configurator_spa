# Stage 1: Build stage
FROM node:20 as build

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Production stage
FROM nginx:alpine

# Copy built application from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration template
COPY nginx.conf.template /etc/nginx/nginx.conf.template

# Create startup script to substitute only our environment variables
RUN echo '#!/bin/sh' > /docker-entrypoint.d/30-nginx-envsubst.sh && \
    echo 'envsubst "\${MONGODB_API_HOST} \${MONGODB_API_PORT} \${MONGODB_SPA_PORT}" < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf' >> /docker-entrypoint.d/30-nginx-envsubst.sh && \
    chmod +x /docker-entrypoint.d/30-nginx-envsubst.sh

# Expose port
EXPOSE 8082

# Start nginx
CMD ["nginx", "-g", "daemon off;"] 