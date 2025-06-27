#!/bin/sh

# Substitute environment variables in nginx configuration
envsubst '${MONGODB_API_HOST} ${MONGODB_API_PORT} ${MONGODB_SPA_PORT}' < /etc/nginx/nginx.conf > /tmp/nginx.conf

# Start nginx with the substituted configuration
exec nginx -g "daemon off;" -c /tmp/nginx.conf 