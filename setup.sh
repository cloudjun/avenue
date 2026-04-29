#!/usr/bin/env bash
set -euo pipefail

echo "==> Avenue dev environment setup"

# Check prerequisites
command -v node >/dev/null || { echo "ERROR: Node.js not found. Install v20+ from https://nodejs.org"; exit 1; }
command -v pnpm >/dev/null || { echo "Installing pnpm..."; npm install -g pnpm@9; }
command -v psql >/dev/null || echo "WARNING: psql not found. Install Postgres locally or use Supabase."

NODE_VER=$(node -e "process.stdout.write(process.versions.node.split('.')[0])")
if [ "$NODE_VER" -lt 20 ]; then
  echo "ERROR: Node.js v20+ required, found v$NODE_VER"
  exit 1
fi

echo "==> Installing dependencies"
pnpm install

echo "==> Setting up environment file"
if [ ! -f .env.local ]; then
  cp .env.example .env.local
  echo "Created .env.local from .env.example — fill in your secrets before running the app."
else
  echo ".env.local already exists, skipping."
fi

echo "==> Running database migrations"
if grep -q 'DATABASE_URL=postgresql://postgres:password' .env.local 2>/dev/null; then
  echo "WARNING: DATABASE_URL looks like the placeholder. Set a real URL in .env.local before running migrations."
else
  pnpm db:generate && pnpm db:migrate
fi

echo ""
echo "Setup complete. Start the dev server with:"
echo "  pnpm dev"
