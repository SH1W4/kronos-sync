#!/bin/bash
# Script para aplicar migration no Vercel Postgres
# Execute: vercel env pull .env.production
# Depois: bash apply-migration.sh

echo "Aplicando migration no banco de produção..."
npx prisma migrate deploy
echo "Migration aplicada com sucesso!"
