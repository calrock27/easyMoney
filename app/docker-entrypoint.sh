#!/bin/sh
set -e

echo "=== easyMoney Startup ==="

# Validate required environment variables
echo "Verifying environment configuration..."
if [ -z "$DATABASE_URL" ]; then
    echo "ERROR: DATABASE_URL environment variable is not set"
    echo "Please set DATABASE_URL in your docker-compose.yml or environment"
    exit 1
fi

if [ -z "$PORT" ]; then
    echo "WARNING: PORT environment variable not set, using default 3000"
fi

echo "Environment validation passed"
echo "DATABASE_URL is configured"

# Run database migrations with error handling
echo "Running database migrations..."
if ! npx prisma migrate deploy; then
    echo "ERROR: Database migration failed!"
    echo "This could be due to:"
    echo "  - Invalid DATABASE_URL"
    echo "  - Database file permissions"
    echo "  - Corrupted migration files"
    echo "Please check the logs above for specific error details"
    exit 1
fi

echo "Database migrations completed successfully"
echo "Starting application..."

# Execute the main command
exec "$@"
