#!/bin/sh

# Docker entrypoint script for AI Marketing Agency

set -e

echo "Starting AI Marketing Agency server..."

# Check if .env exists, if not create from example
if [ ! -f .env ]; then
    echo "Creating .env from .env.example..."
    cp .env.example .env
fi

# Wait for Redis to be ready (simple check)
if [ "$WAIT_FOR_REDIS" = "true" ]; then
    echo "Waiting for Redis..."
    timeout 30 sh -c 'until nc -z redis 6379; do sleep 1; done'
    echo "Redis is ready!"
fi

# Start the server
exec node server/index.js
