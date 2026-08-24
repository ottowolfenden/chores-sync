#!/bin/bash

if [[ $1 == cron ]]; then
    cd app/server/cron
    wrangler dev --env-file ../../../.env
else
    adb kill-server
    adb start-server
    adb reverse tcp:8788 tcp:8788
    npm run build
    wrangler pages dev --cwd app/server ../client/dist
fi