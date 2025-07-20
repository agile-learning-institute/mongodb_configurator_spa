#!/bin/sh

# Set default values for environment variables if not provided
export API_HOST=${API_HOST:-localhost}
export API_PORT=${API_PORT:-8081}
export SPA_PORT=${SPA_PORT:-8082}

# Substitute environment variables in nginx configuration
envsubst '${API_HOST} ${API_PORT} ${SPA_PORT}' < /etc/nginx/nginx.conf > /tmp/nginx.conf

# Start nginx with the substituted configuration
exec nginx -g "daemon off;" -c /tmp/nginx.conf 