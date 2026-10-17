#!/usr/bin/env bash
# Kiểm kiểu cho MỘT gói nội dung (không đụng các gói khác đang được viết song song).
# Usage: scripts/tsc-pack.sh src/engine/narrative/paths/<file>.ts
set -euo pipefail
cd "$(dirname "$0")/.."
f="$1"; tmp=$(mktemp -p . .tsconfig.pack.XXXX.json)
trap 'rm -f "$tmp"' EXIT
printf '{ "extends": "./tsconfig.json", "include": ["%s"] }\n' "$f" > "$tmp"
npx tsc --noEmit -p "$tmp" && echo "PASS tsc-pack $f"
