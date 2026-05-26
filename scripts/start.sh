#!/bin/sh
set -e

echo "Applying Prisma migrations..."
npx prisma migrate deploy
echo "Seeding baseline data (idempotent)..."
npx prisma db seed
echo "Starting Score..."
exec npm start
