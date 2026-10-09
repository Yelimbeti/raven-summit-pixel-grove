#!/bin/sh
# Idempotent preview boot. Safe to run more than once.
if curl -sf -o /dev/null --max-time 1 http://127.0.0.1:8080/; then
  exit 0
fi
cd /workspace
npm run dev
