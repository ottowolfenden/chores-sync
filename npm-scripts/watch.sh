#!/bin/bash

adb kill-server
adb start-server
adb reverse tcp:8788 tcp:8788
npm run build
(
    chokidar "app/src/**/*" -i "app/src/assets/fonts/**" -c "npm run build" &
    wrangler pages dev ../app/dist --cwd server --live-reload &
    wait
)