#!/bin/bash

adb kill-server
adb start-server
adb reverse tcp:8788 tcp:8788
npm run build
(
    chokidar "app/src/**/*" -c "npm run build" &
    wrangler pages dev app/dist --live-reload &
    wait
)