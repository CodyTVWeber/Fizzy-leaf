#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
EXAMPLE="$ROOT/.env.example"
ENV_FILE="$ROOT/.env"

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  cat <<'EOF'
Run the Hydrogen storefront locally.

  ./scripts/run-local.sh

Creates .env from .env.example if missing, installs npm
deps, then starts `shopify hydrogen dev` at http://localhost:3000/
EOF
  exit 0
fi

need() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "Need $1 on PATH." >&2
    exit 1
  }
}

need node
need npm

node_major="$(node -p 'process.versions.node.split(".")[0]')"
if [[ "$node_major" != "22" && "$node_major" != "24" ]]; then
  echo "Node $node_major found; Hydrogen wants 22 or 24." >&2
  exit 1
fi

ensure_env() {
  if [[ -f "$ENV_FILE" ]]; then
    return
  fi
  if [[ ! -f "$EXAMPLE" ]]; then
    echo "Missing $EXAMPLE — cannot create .env" >&2
    exit 1
  fi
  local secret
  secret="$(node -e 'console.log(require("crypto").randomBytes(32).toString("hex"))')"
  sed "s/^SESSION_SECRET=.*/SESSION_SECRET=$secret/" "$EXAMPLE" > "$ENV_FILE"
  echo "Wrote $ENV_FILE from .env.example (new SESSION_SECRET)."
}

ensure_env

cd "$ROOT"
if [[ ! -d node_modules ]]; then
  npm install
fi

echo "Hydrogen → http://localhost:3000/"
exec npm run dev
