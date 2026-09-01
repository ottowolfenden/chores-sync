#!/bin/bash

set -e

if [[ $1 == cron ]]; then
    cd app/server/cron
    wrangler dev --env-file ../../../.env
else
    npm run build
    adb kill-server || true
    adb start-server || true
    adb reverse tcp:8788 tcp:8788 || true
    wrangler pages dev --cwd app/server ../client/dist
fi