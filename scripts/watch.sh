#!/bin/bash

adb kill-server
adb start-server
adb reverse tcp:8788 tcp:8788
npm run build
(
    chokidar "app/client/src/**/*" -i "app/client/src/assets/fonts/**" -c "npm run build" &
    wrangler pages dev --cwd app/server ../client/dist --live-reload &
    wait
)