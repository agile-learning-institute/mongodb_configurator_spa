#!/bin/sh

# Substitute environment variables in nginx configuration
envsubst '${API_HOST} ${API_PORT} ${SPA_PORT}' < /etc/nginx/nginx.conf > /tmp/nginx.conf

# Start nginx with the substituted configuration
exec nginx -g "daemon off;" -c /tmp/nginx.conf 