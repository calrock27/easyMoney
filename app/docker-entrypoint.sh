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

# Extract database path from DATABASE_URL (assuming file: protocol)
# Remove 'file:' prefix
DB_PATH=$(echo "$DATABASE_URL" | sed 's/^file://')
DB_DIR=$(dirname "$DB_PATH")

echo "Checking database configuration..."
echo "Database path: $DB_PATH"

# Check if directory exists
if [ ! -d "$DB_DIR" ]; then
    echo "Creating database directory: $DB_DIR"
    mkdir -p "$DB_DIR"
fi

# Check write permissions
if [ ! -w "$DB_DIR" ]; then
    echo "ERROR: Database directory '$DB_DIR' is not writable!"
    echo "Current user: $(id)"
    echo "Directory permissions: $(ls -ld "$DB_DIR")"
    echo "HINT: If using Docker volumes, run 'chown -R 1001:1001 ./data' on your host machine."
    exit 1
fi

# Create empty DB file if it doesn't exist to verify write access and ensure migration has a target
if [ ! -f "$DB_PATH" ]; then
    echo "Database file not found. Creating empty file at $DB_PATH..."
    touch "$DB_PATH" || {
        echo "ERROR: Failed to create database file!"
        echo "Please check directory permissions."
        exit 1
    }
fi

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
