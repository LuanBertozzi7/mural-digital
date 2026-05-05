#!/bin/sh
set -e

echo "[entrypoint] Rodando migrações..."
npx prisma migrate deploy

echo "[entrypoint] Iniciando servidor..."
exec node src/server.js
