#!/bin/bash

set -e

npm run build
adb kill-server || true
adb start-server || true
adb reverse tcp:8788 tcp:8788 || true
(
    chokidar "app/client/src/**/*" -i "app/client/src/assets/fonts/**" -c "npm run build" &
    wrangler pages dev --cwd app/server ../client/dist --live-reload &
    wait
)